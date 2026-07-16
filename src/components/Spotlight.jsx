import { Search, X, Clock, Zap } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import useWindowStore from "#store/window";
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

const Spotlight = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [historyItems, setHistoryItems] = useState([]);
  const inputRef = useRef(null);
  
  const { openWindow } = useWindowStore();
  const suggestedItems = useMemo(() => getSuggestedItems(), []);

  // Sync history when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setHistoryItems(getHistory());
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

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
              // Note: We highlight the main name if it matched partially, else fallback to just showing it
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

    // Sort by score
    matchedItems.sort((a, b) => a.score - b.score);
    
    setResults(matchedItems.slice(0, 8)); // Limit to 8 results
    setSelectedIndex(0);
  }, [query]);

  // Combined list for keyboard navigation when query is empty
  const defaultList = query.trim() === "" ? [...historyItems, ...suggestedItems] : [];
  const activeList = query.trim() === "" ? defaultList : results;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

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
        setQuery(activeList[selectedIndex].name);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeList, selectedIndex, query, onClose]);

  const handleSelectItem = (item) => {
    addHistoryItemById(item.id);
    
    if (item.url) {
      window.open(item.url, "_blank");
    } else if (item.data) {
      openWindow(item.type, item.data);
    } else {
      openWindow(item.type);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  // Render a section (History or Suggested)
  const renderSection = (title, icon, items, startIndex) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {icon}
          {title}
        </div>
        <div className="flex flex-col">
          {items.map((item, index) => {
            const globalIndex = startIndex + index;
            const isSelected = globalIndex === selectedIndex;
            return (
              <div
                key={`${item.id}-${index}`}
                onClick={() => handleSelectItem(item)}
                className={`flex items-center gap-4 px-5 py-2.5 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200"
                }`}
              >
                <img
                  src={item.icon}
                  alt={item.name}
                  className="size-7 object-contain"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                </div>
                <p
                  className={`text-xs truncate ${
                    isSelected ? "text-blue-100" : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {item.category}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-start justify-center pt-32 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="fixed inset-0 w-screen h-screen bg-black/40 dark:bg-black/60 backdrop-blur-sm" />

      {/* Spotlight Search Box */}
      <div
        className="relative w-full max-w-2xl mx-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-200 border border-gray-200/50 dark:border-gray-700/50 ring-1 ring-black/5 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight Search"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700/50">
          <Search className="size-5 text-gray-400 dark:text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent outline-none text-xl font-medium text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600"
            aria-label="Search query"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Clear search"
            >
              <X className="size-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex flex-col max-h-[60vh] overflow-y-auto py-2 overscroll-contain">
          
          {/* Default State (Empty Query) */}
          {query.trim() === "" && (
            <div className="animate-in fade-in duration-300">
              {renderSection("Recently Opened", <Clock className="size-3.5" />, historyItems, 0)}
              {renderSection("Suggested", <Zap className="size-3.5" />, suggestedItems, historyItems.length)}
            </div>
          )}

          {/* Search Results */}
          {query.trim() !== "" && results.length > 0 && (
            <div className="flex flex-col">
              {results.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  onClick={() => handleSelectItem(item)}
                  style={{
                    animationDelay: `${index * 20}ms`,
                    animationFillMode: 'both'
                  }}
                  className={`flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors animate-in fade-in slide-in-from-top-1 ${
                    index === selectedIndex
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
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
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.trim() !== "" && results.length === 0 && (
            <div className="px-5 py-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
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

export default Spotlight;
