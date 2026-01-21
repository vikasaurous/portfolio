import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { locations } from "#constants";
import useWindowStore from "#store/Window";

const Spotlight = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { openWindow } = useWindowStore();

  // All searchable items
  const searchableItems = [
    { name: "Finder", type: "finder", icon: "/images/finder.png", category: "Application" },
    { name: "Safari", type: "safari", icon: "/images/safari.png", category: "Application" },
    { name: "Terminal", type: "terminal", icon: "/images/terminal.png", category: "Application" },
    { name: "Photos", type: "photos", icon: "/images/photos.png", category: "Application" },
    { name: "Contact", type: "contact", icon: "/images/contact.png", category: "Application" },
    { name: "Resume", type: "resume", icon: "/images/pdf.png", category: "Application" },
    ...(locations.about?.children || []).map(file => ({
      name: file.name,
      type: "txtfile",
      data: file,
      icon: file.icon,
      category: "Document"
    })),
    ...(locations.work?.children || []).flatMap(project => 
      (project.children || []).map(file => ({
        name: file.name,
        type: project.type === "folder" ? "finder" : "txtfile",
        data: file,
        icon: file.icon,
        category: "Project"
      }))
    ),
  ];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const filtered = searchableItems.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered.slice(0, 8)); // Limit to 8 results
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        handleSelectItem(results[selectedIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelectItem = (item) => {
    if (item.data) {
      openWindow(item.type, item.data);
    } else {
      openWindow(item.type);
    }
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-start justify-center pt-32 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="fixed inset-0 w-screen h-screen bg-black/50 backdrop-blur-xl" />

      {/* Spotlight Search Box */}
      <div
        className="relative w-full max-w-2xl mx-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-10 duration-300 border border-gray-200/50 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <Search className="size-5 text-gray-400 dark:text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent outline-none text-lg font-medium text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="size-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="flex flex-col max-h-96 overflow-y-auto">
            {results.map((item, index) => (
              <div
                key={`${item.type}-${item.name}-${index}`}
                onClick={() => handleSelectItem(item)}
                className={`flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors ${
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
                  <p className="font-medium truncate">{item.name}</p>
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
        {query && results.length === 0 && (
          <div className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">No results found for "{query}"</p>
          </div>
        )}

        {/* Hint */}
        {!query && (
          <div className="px-5 py-6 text-center text-gray-400 dark:text-gray-500 text-sm">
            <p>Search for applications, documents, and more</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Spotlight;
