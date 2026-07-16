import { locations } from "#constants";

// Compile the base list of all items that can be searched or opened.
export const searchableItems = [
  {
    id: "finder-portfolio",
    name: "Portfolio",
    type: "finder",
    icon: "images/finder.png",
    category: "Application",
    aliases: ["Finder", "Files", "Explorer", "Projects"],
  },
  {
    id: "safari-articles",
    name: "Articles",
    type: "safari",
    icon: "images/safari.png",
    category: "Application",
    aliases: ["Safari", "Browser", "Internet", "Web"],
  },
  {
    id: "terminal-skills",
    name: "Skills",
    type: "terminal",
    icon: "images/terminal.png",
    category: "Application",
    aliases: ["Terminal", "Command", "Prompt"],
  },
  {
    id: "contact-app",
    name: "Contact",
    type: "contact",
    icon: "images/contact.png",
    category: "Application",
    aliases: ["Email", "Message", "Get in touch"],
  },
  {
    id: "resume-app",
    name: "Resume",
    type: "resume",
    icon: "images/pdf.png",
    category: "Application",
    aliases: ["CV", "Download"],
  },
  {
    id: "social-github",
    name: "GitHub",
    type: "url",
    url: "https://github.com/vikasaurous",
    icon: "icons/github.svg",
    category: "Link",
    aliases: ["Social", "Code"],
  },
  {
    id: "social-linkedin",
    name: "LinkedIn",
    type: "url",
    url: "https://www.linkedin.com/in/connectvikasyadav/",
    icon: "icons/linkedin.svg",
    category: "Link",
    aliases: ["Social", "Profile", "Network"],
  },
  ...(locations.about?.children || []).map((file) => ({
    id: `about-${file.id}`,
    name: file.name,
    type: "txtfile",
    data: file,
    icon: file.icon,
    category: "Document",
    aliases: file.name.toLowerCase().includes("me") ? ["About Me"] : [],
  })),
  ...(locations.work?.children || []).flatMap((project) =>
    (project.children || []).map((file) => ({
      id: `work-${project.id}-${file.id}`,
      name: file.name,
      type: project.type === "folder" ? "finder" : "txtfile",
      data: file,
      icon: file.icon,
      category: "Project",
      aliases: [project.name],
    })),
  ),
];

// Suggested quick actions
export const suggestedActionIds = [
  "about-4", // about-me.txt (Assuming id=4 from constants)
  "finder-portfolio",
  "resume-app",
  "terminal-skills",
  "social-github",
  "social-linkedin",
  "contact-app",
];

export const getSuggestedItems = () => {
  return suggestedActionIds
    .map((id) => searchableItems.find((item) => item.id === id))
    .filter(Boolean);
};

// Fuzzy match algorithm
// Returns an array of matched character indices, or null if no match
export const fuzzyMatch = (text, query) => {
  if (!query) return null;

  const textLower = text.toLowerCase();
  const searchLower = query.toLowerCase();
  let searchIndex = 0;
  const matches = [];

  for (let i = 0; i < textLower.length; i++) {
    if (
      searchIndex < searchLower.length &&
      textLower[i] === searchLower[searchIndex]
    ) {
      matches.push(i);
      searchIndex++;
    }
  }

  if (searchIndex === searchLower.length) {
    return matches;
  }
  return null;
};

// Score a match for sorting (smaller is better)
// E.g., exact matches score best, matches at the start of words score better.
export const getMatchScore = (text, matches) => {
  if (!matches || matches.length === 0) return 1000;
  let score = 0;
  // Penalty for gaps between matches
  for (let i = 1; i < matches.length; i++) {
    score += matches[i] - matches[i - 1] - 1;
  }
  // Penalty for not matching start of string
  score += matches[0] * 2;
  return score;
};

// History Management
const HISTORY_KEY = "spotlight_history";
const MAX_HISTORY = 6;

export const getHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const historyIds = JSON.parse(raw);
    return historyIds
      .map((id) => searchableItems.find((item) => item.id === id))
      .filter(Boolean);
  } catch (e) {
    console.error("Failed to parse spotlight history", e);
    return [];
  }
};

export const addHistoryItemByData = (windowKey, data) => {
  // Find the corresponding item in searchableItems
  let matchedItem = null;

  if (data && data.id) {
    // If it's a specific file, try to match by data.id and type
    matchedItem = searchableItems.find(
      (item) => item.data?.id === data.id && item.type === windowKey,
    );
  }

  if (!matchedItem) {
    // Match by windowKey (e.g. 'terminal', 'safari')
    // Prefer exact type match for applications
    matchedItem = searchableItems.find(
      (item) => item.type === windowKey && !item.data,
    );
  }

  if (!matchedItem) return; // Ignore if not a searchable item

  addHistoryItemById(matchedItem.id);
};

export const addHistoryItemById = (id) => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    let historyIds = raw ? JSON.parse(raw) : [];

    // Remove duplicate if exists
    historyIds = historyIds.filter((existingId) => existingId !== id);

    // Add to front
    historyIds.unshift(id);

    // Trim
    if (historyIds.length > MAX_HISTORY) {
      historyIds = historyIds.slice(0, MAX_HISTORY);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyIds));
  } catch (e) {
    console.error("Failed to save spotlight history", e);
  }
};
