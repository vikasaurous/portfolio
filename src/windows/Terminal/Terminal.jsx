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
  <span className="text-[#32d74b] font-semibold select-none shrink-0">
    {PROMPT_USER}@{PROMPT_HOST}
    <span className="text-gray-400"> {PROMPT_DIR} % </span>
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
        <span className="text-gray-100 break-all">
          {entry.command}
        </span>
      </div>

      {/* Output — never rendered for "clear" type (clear wipes history instead) */}
      {entry.response.type !== "clear" && (
        <div
          className={`mt-0.5 pl-2 whitespace-pre font-mono ${
            isError ? "text-[#ff453a]" : "text-gray-300"
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

const QUICK_COMMANDS = [
  "help",
  "whoami",
  "skills",
  "projects",
  "experience",
  "sudo hire-vikas",
  "clear",
];

// ─── Terminal Body (shared between Desktop Window & Mobile iOS Sheet) ─────────

export const TerminalBody = ({ bodyStyle, className = "", quickCommands = false }) => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const theme = useThemeStore((s) => s.theme);

  // ── State ──
  const [history,              setHistory]              = useState([]);
  const [commandHistory,       setCommandHistory]       = useState([]);
  const [commandHistoryIndex,  setCommandHistoryIndex]  = useState(-1);
  const [inputValue,           setInputValue]           = useState("");

  // ── Refs ──
  const inputRef  = useRef(null);
  const bottomRef = useRef(null);
  const bodyRef   = useRef(null);

  // ── Focus input once on desktop mount (skip soft keyboard pop on touch phones) ─
  useEffect(() => {
    if (!quickCommands) inputRef.current?.focus();
  }, [quickCommands]);

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
  const runCommand = useCallback((rawInput) => {
    const raw = rawInput.trim();
    setInputValue("");
    setCommandHistoryIndex(-1);
    if (!raw) return;

    setCommandHistory((prev) => {
      const updated = [raw, ...prev.filter((c) => c !== raw)];
      return updated.slice(0, MAX_HISTORY);
    });

    const ctx      = { commandHistory, theme };
    const response = executeCommand(raw, ctx);
    if (!response) return;

    if (response.type === "clear") {
      setHistory([]);
      return;
    }

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
  }, [commandHistory, theme, dispatchAction]);

  const handleSubmit = useCallback(() => {
    runCommand(inputValue);
  }, [inputValue, runCommand]);

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

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${className}`.trim()}>
      {/* Terminal body */}
      <div
        ref={bodyRef}
        role="log"
        aria-label="Terminal output"
        aria-live="polite"
        onClick={handleBodyClick}
        className="
          flex flex-col flex-1 min-h-0
          bg-transparent
          text-gray-100
          font-mono text-xs leading-relaxed
          overflow-y-auto overflow-x-hidden
          p-4
          cursor-text
        "
        style={bodyStyle}
      >
        {/* Welcome banner */}
        <div className="mb-4 text-[#32d74b] whitespace-pre leading-tight overflow-x-auto">
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

      {/* Mobile tap-to-run command bar */}
      {quickCommands && (
        <div className="flex items-center gap-1.5 px-3 py-2.5 border-t border-white/10 overflow-x-auto shrink-0">
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => runCommand(cmd)}
              className="px-3 py-1.5 rounded-full bg-white/10 active:bg-white/20 border border-white/15 text-[11px] font-mono font-medium text-gray-100 whitespace-nowrap cursor-pointer shrink-0"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Desktop Window Wrapper Component ─────────────────────────────────────────

const Terminal = ({ isMaximized }) => {
  const [headerH, setHeaderH] = useState(48);
  const headerRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) setHeaderH(headerRef.current.offsetHeight);
  }, [isMaximized]);

  return (
    <>
      <div id="window-header" ref={headerRef}>
        <WindowControl target="terminal" />
        <h2>Terminal — zsh</h2>
      </div>

      <TerminalBody
        bodyStyle={
          isMaximized
            ? { height: `calc(100vh - ${headerH}px)`, minHeight: 0 }
            : { height: "340px", minHeight: 0 }
        }
      />
    </>
  );
};

// ─── HOC Wrapping ─────────────────────────────────────────────────────────────

const TerminalWindow = WindowWrapper(Terminal, "terminal");
export default TerminalWindow;
