import { useState, useEffect, useRef, useCallback, memo } from "react";
import { WindowControl } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import useWindowStore from "#store/window";
import useThemeStore from "#store/theme";
import { executeCommand, commandNames } from "./commands.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROMPT_USER = "vikas";
const PROMPT_HOST = "portfolio";
const PROMPT_DIR  = "~";
const MAX_HISTORY  = 100;   // command history cap
const MAX_INPUT    = 1000;  // prevent runaway DOM from enormous strings

const WELCOME_BANNER = [
  "██╗   ██╗██╗██╗  ██╗ █████╗ ███████╗",
  "██║   ██║██║██║ ██╔╝██╔══██╗██╔════╝",
  "██║   ██║██║█████╔╝ ███████║███████╗",
  "╚██╗ ██╔╝██║██╔═██╗ ██╔══██║╚════██║",
  " ╚████╔╝ ██║██║  ██╗██║  ██║███████║",
  "  ╚═══╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝",
  "",
  "  Welcome to Vikas's Portfolio Terminal",
  '  Type "help" for available commands.',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flatten a response content (string | string[]) into an array of lines. */
const toLines = (content) =>
  Array.isArray(content) ? content : String(content).split("\n");

/** Monotonically increasing ID for stable React keys. */
let _nextId = 0;
const nextId = () => String(++_nextId);

// ─── Sub-components ───────────────────────────────────────────────────────────

/** memo: Prompt never changes — avoid re-rendering on every keystroke. */
const Prompt = memo(() => (
  <span className="text-[#34C759] dark:text-[#32d74b] font-semibold select-none shrink-0">
    {PROMPT_USER}@{PROMPT_HOST}
    <span className="text-gray-400 dark:text-gray-500"> {PROMPT_DIR} % </span>
  </span>
));
Prompt.displayName = "Prompt";

const HistoryEntry = memo(({ entry }) => {
  const lines   = toLines(entry.response.content ?? "");
  const isError = entry.response.type === "error";

  return (
    <div className="mb-2 leading-snug">
      {/* Prompt + command */}
      <div className="flex items-baseline gap-1 flex-wrap">
        <Prompt />
        <span className="text-gray-800 dark:text-gray-100 break-all">
          {entry.command}
        </span>
      </div>

      {/* Output — never rendered for "clear" type (clear wipes history instead) */}
      {entry.response.type !== "clear" && (
        <div
          className={`mt-0.5 pl-2 whitespace-pre font-mono ${
            isError
              ? "text-[#FF3B30] dark:text-[#ff453a]"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {lines.map((line, i) => (
            <div key={i}>{line || "\u00a0"}</div>
          ))}
        </div>
      )}
    </div>
  );
});
HistoryEntry.displayName = "HistoryEntry";

// ─── Terminal Component ───────────────────────────────────────────────────────

const Terminal = ({ isMaximized }) => {
  const { openWindow } = useWindowStore();
  const { theme }      = useThemeStore();

  // ── State ──
  const [history,              setHistory]              = useState([]);
  const [commandHistory,       setCommandHistory]       = useState([]);
  const [commandHistoryIndex,  setCommandHistoryIndex]  = useState(-1);
  const [inputValue,           setInputValue]           = useState("");
  const [headerH,              setHeaderH]              = useState(48);

  // ── Refs ──
  const inputRef  = useRef(null);
  const bottomRef = useRef(null);
  const bodyRef   = useRef(null);
  const headerRef = useRef(null);

  // ── Measure header height when maximize state changes ──
  useEffect(() => {
    if (headerRef.current) setHeaderH(headerRef.current.offsetHeight);
  }, [isMaximized]);

  // ── Focus input once on mount (not on every render like autoFocus) ──
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Auto-scroll within the terminal body (never the page) ──
  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history]);

  // ── Re-focus input whenever user clicks anywhere inside the terminal ──
  const handleBodyClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // ── Side-effect dispatcher ──
  const dispatchAction = useCallback(
    (response) => {
      if (response.type !== "action") return;
      const { action, payload } = response;

      if (action === "openLink") {
        window.open(payload.href, "_blank", "noopener,noreferrer");
      }
      if (action === "openWindow") {
        openWindow(payload.windowKey);
      }
    },
    [openWindow]
  );

  // ── Command execution ──
  const handleSubmit = useCallback(() => {
    const raw = inputValue.trim();
    setInputValue("");
    setCommandHistoryIndex(-1);
    if (!raw) return;

    // Capture commandHistory synchronously before the async setState
    setCommandHistory((prev) => {
      const updated = [raw, ...prev.filter((c) => c !== raw)];
      return updated.slice(0, MAX_HISTORY);
    });

    // Read current commandHistory from the ref to avoid stale closure
    const ctx      = { commandHistory, theme };
    const response = executeCommand(raw, ctx);
    if (!response) return;

    // clear: wipe history and exit
    if (response.type === "clear") {
      setHistory([]);
      return;
    }

    // action: build user-visible feedback text
    const displayResponse =
      response.type === "action"
        ? {
            type:    "text",
            content: response.payload?.message
                      ?? response.payload?.label
                      ?? `→ ${response.action}`,
          }
        : response;

    setHistory((prev) => [
      ...prev,
      { id: nextId(), command: raw, response: displayResponse },
    ]);

    dispatchAction(response);
  }, [inputValue, commandHistory, theme, dispatchAction]);

  // ── Keyboard handler ──
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "Enter": {
          e.preventDefault();
          handleSubmit();
          break;
        }

        case "ArrowUp": {
          e.preventDefault();
          if (commandHistory.length === 0) break;
          const nextIdx = Math.min(
            commandHistoryIndex + 1,
            commandHistory.length - 1
          );
          setCommandHistoryIndex(nextIdx);
          setInputValue(commandHistory[nextIdx] ?? "");
          break;
        }

        case "ArrowDown": {
          e.preventDefault();
          const prevIdx = commandHistoryIndex - 1;
          if (prevIdx < 0) {
            setCommandHistoryIndex(-1);
            setInputValue("");
          } else {
            setCommandHistoryIndex(prevIdx);
            setInputValue(commandHistory[prevIdx] ?? "");
          }
          break;
        }

        case "Escape": {
          setInputValue("");
          setCommandHistoryIndex(-1);
          break;
        }

        // Ctrl+C — cancel current input (Unix convention)
        case "c": {
          if (e.ctrlKey) {
            e.preventDefault();
            setHistory((prev) => [
              ...prev,
              {
                id:       nextId(),
                command:  inputValue,
                response: { type: "text", content: "" },
              },
            ]);
            setInputValue("");
            setCommandHistoryIndex(-1);
          }
          break;
        }

        // Ctrl+L — clear screen (identical to `clear` command)
        case "l": {
          if (e.ctrlKey) {
            e.preventDefault();
            setHistory([]);
            setInputValue("");
            setCommandHistoryIndex(-1);
          }
          break;
        }

        case "Tab": {
          e.preventDefault();
          if (!inputValue) break;

          const partial = inputValue.toLowerCase();
          const matches = commandNames.filter(
            // skip multi-word registry keys for tab (e.g. "sudo hire-vikas")
            (name) => !name.includes(" ") && name.startsWith(partial)
          );

          if (matches.length === 1) {
            setInputValue(matches[0]);
          } else if (matches.length > 1) {
            // Show completions without creating a fake history entry
            setHistory((prev) => [
              ...prev,
              {
                id:       nextId(),
                command:  "",
                response: { type: "text", content: matches.join("    ") },
              },
            ]);
          }
          break;
        }

        default:
          break;
      }
    },
    [handleSubmit, commandHistoryIndex, commandHistory, inputValue]
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Window chrome */}
      <div id="window-header" ref={headerRef}>
        <WindowControl target="terminal" />
        <h2>Terminal — zsh</h2>
      </div>

      {/* Terminal body */}
      <div
        ref={bodyRef}
        role="log"
        aria-label="Terminal output"
        aria-live="polite"
        onClick={handleBodyClick}
        className="
          flex flex-col
          bg-gray-900 dark:bg-[#1e1e1e]
          text-gray-100
          font-mono text-xs leading-relaxed
          overflow-y-scroll
          p-4
          cursor-text
        "
        style={
          isMaximized
            ? { height: `calc(100vh - ${headerH}px)`, minHeight: 0 }
            : { height: "340px", minHeight: 0 }
        }
      >
        {/* Welcome banner */}
        <div className="mb-4 text-[#34C759] dark:text-[#32d74b] whitespace-pre leading-tight">
          {WELCOME_BANNER.map((line, i) => (
            <div key={i}>{line || "\u00a0"}</div>
          ))}
        </div>

        {/* Command history — stable keys via entry.id, not array index */}
        {history.map((entry) => (
          <HistoryEntry key={entry.id} entry={entry} />
        ))}

        {/* Active input row */}
        <div className="flex items-baseline gap-1 mt-1">
          <Prompt />
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              maxLength={MAX_INPUT}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="
                w-full bg-transparent outline-none border-none
                text-gray-100 caret-[#34C759]
                font-mono text-xs
              "
              aria-label="Terminal command input"
            />
          </div>
        </div>

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </>
  );
};

// ─── HOC Wrapping ─────────────────────────────────────────────────────────────

const TerminalWindow = WindowWrapper(Terminal, "terminal");
export default TerminalWindow;
