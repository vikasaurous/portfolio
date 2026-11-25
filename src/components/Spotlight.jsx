import { Search, X, Clock, Zap } from "lucide-react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import useWindowStore from "#store/window";
import useSafariStore from "#store/safari";
import { prefetchWindow } from "#windows/loaders.js";
import {
  searchableItems,
  getSuggestedItems,
  fuzzyMatch,
  getMatchScore,
  getHistory,
  addHistoryItemById
} from "../utils/spotlight";

// Component for highlighting matched characters
const HighlightedText = ({ text, matches }) => {
  if (!matches || matches.length === 0) return <span>{text}</span>;

  return (
    <span>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={matches.includes(i) ? "text-blue-500 font-semibold" : ""}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

const SpotlightDialog = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [historyItems] = useState(() => getHistory());
  const inputRef = useRef(null);

  const openWindow = useWindowStore((s) => s.openWindow);
  const suggestedItems = useMemo(() => getSuggestedItems(), []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Derive search results synchronously when query changes
  const results = useMemo(() => {
    if (query.trim() === "") return [];

    const matchedItems = [];

    for (const item of searchableItems) {
      // Check main name
      let matches = fuzzyMatch(item.name, query);
      let score = getMatchScore(item.name, matches);

      // Check aliases if no match or bad score
      if (!matches && item.aliases) {
        for (const alias of item.aliases) {
          const aliasMatches = fuzzyMatch(alias, query);
          if (aliasMatches) {
            const aliasScore = getMatchScore(alias, aliasMatches);
            if (!matches || aliasScore < score) {
              matches = aliasMatches;
              score = aliasScore;
            }
          }
        }
      }

      if (matches) {
        matchedItems.push({
          ...item,
          matches: fuzzyMatch(item.name, query), // Highlight on main name specifically
          score,
        });
      }
    }

    matchedItems.sort((a, b) => a.score - b.score);
    return matchedItems.slice(0, 8);
  }, [query]);

  const handleQueryChange = useCallback((nextQuery) => {
    setQuery(nextQuery);
    setSelectedIndex(0);
  }, []);

  // Combined list for keyboard navigation when query is empty
  const defaultList = useMemo(
    () => (query.trim() === "" ? [...historyItems, ...suggestedItems] : []),
    [query, historyItems, suggestedItems],
  );
  const activeList = query.trim() === "" ? defaultList : results;

  const handleSelectItem = useCallback((item) => {
    addHistoryItemById(item.id);
    
    if (item.url) {
      // Open external links in the built-in Safari browser
      useSafariStore.getState().openUrl(item.url);
      openWindow("safari");
    } else if (item.data) {
      openWindow(item.type, item.data);
    } else {
      openWindow(item.type);
    }
    
    onClose();
  }, [openWindow, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev < activeList.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && activeList.length > 0) {
        e.preventDefault();
        handleSelectItem(activeList[selectedIndex]);
      } else if (e.key === "Tab" && activeList.length > 0 && query.trim() !== "") {
        e.preventDefault();
        handleQueryChange(activeList[selectedIndex].name);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeList, selectedIndex, query, onClose, handleSelectItem, handleQueryChange]);

  // Render a section (History or Suggested)
  const renderSection = (title, icon, items, startIndex) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {icon}
          {title}
        </div>
        <div className="flex flex-col gap-0.5">
          {items.map((item, index) => {
            const globalIndex = startIndex + index;
            const isSelected = globalIndex === selectedIndex;
            return (
              <button
                type="button"
                key={`${item.id}-${index}`}
                onMouseEnter={() => prefetchWindow(item.url ? "safari" : item.type)}
                onClick={() => handleSelectItem(item)}
                className={`flex items-center gap-4 mx-2.5 px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors text-left border-0 ${
                  isSelected
                    ? "bg-[#0a84ff] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                    : "bg-transparent hover:bg-white/50 dark:hover:bg-white/10 text-gray-900 dark:text-gray-100"
                }`}
              >
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className="size-8 object-contain shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                </div>
                <p
                  className={`text-xs truncate ${
                    isSelected ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.category}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-start justify-center pt-14 md:pt-32"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="fixed inset-0 w-screen h-screen bg-black/30 dark:bg-black/50 backdrop-blur-md" />

      {/* Spotlight Search Box — Tahoe Liquid Glass */}
      <div
        className="lg-popover relative w-full max-w-2xl mx-4 rounded-[22px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight Search"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.07] dark:border-white/[0.08]">
          <Search className="size-5 text-gray-500 dark:text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent outline-none text-xl font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            aria-label="Search query"
          />
          {query && (
            <button
              onClick={() => {
                handleQueryChange("");
                inputRef.current?.focus();
              }}
              className="lg-icon-btn"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex flex-col max-h-[60vh] overflow-y-auto py-2.5 overscroll-contain">
          
          {/* Default State (Empty Query) */}
          {query.trim() === "" && (
            <div>
              {renderSection("Recently Opened", <Clock className="size-3.5" />, historyItems, 0)}
              {renderSection("Suggested", <Zap className="size-3.5" />, suggestedItems, historyItems.length)}
            </div>
          )}

          {/* Search Results */}
          {query.trim() !== "" && results.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {results.map((item, index) => (
                <button
                  type="button"
                  key={`${item.id}-${index}`}
                  onMouseEnter={() => prefetchWindow(item.url ? "safari" : item.type)}
                  onClick={() => handleSelectItem(item)}
                  className={`flex items-center gap-4 mx-2.5 px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors text-left border-0 ${
                    index === selectedIndex
                      ? "bg-[#0a84ff] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                      : "bg-transparent hover:bg-white/50 dark:hover:bg-white/10 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <img
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    className="size-8 object-contain"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[15px] truncate">
                      <HighlightedText text={item.name} matches={item.matches} />
                    </p>
                    <p
                      className={`text-xs truncate ${
                        index === selectedIndex ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {item.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.trim() !== "" && results.length === 0 && (
            <div className="px-5 py-12 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                <Search className="size-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-800 dark:text-gray-200 font-medium">No results found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                We couldn't find any matches for "{query}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const Spotlight = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return <SpotlightDialog onClose={onClose} />;
};

export default Spotlight;
