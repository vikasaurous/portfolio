const navLinks = [
  {
    id: 1,
    name: "Projects",
    type: "finder",
  },
  {
    id: 3,
    name: "Contact",
    type: "contact",
  },
  {
    id: 4,
    name: "Resume",
    type: "resume",
  },
];

const navIcons = [
  {
    id: 1,
    img: "icons/wifi.svg",
    name: "Status",
  },
  {
    id: 2,
    img: "icons/search.svg",
    name: "Spotlight Search",
  },
  {
    id: 3,
    img: "icons/user.svg",
    name: "About Me",
  },
  {
    id: 4,
    img: "icons/mode.svg",
    name: "Control Center",
  },
];

const dockApps = [
  {
    id: "finder",
    name: "Portfolio", // was "Finder"
    icon: "finder.png",
    canOpen: true,
  },
  {
    id: "contact",
    name: "Contact", // or "Get in touch"
    icon: "contact.png",
    canOpen: true,
  },
  {
    id: "terminal",
    name: "Skills", // was "Terminal"
    icon: "terminal.png",
    canOpen: true,
  },
  {
    id: "trash",
    name: "Archive", // was "Trash"
    icon: "trash.png",
    canOpen: true,
  },
];

const blogPosts = [
  {
    id: 1,
    date: "Sep 2, 2025",
    title:
      "TypeScript Explained: What It Is, Why It Matters, and How to Master It",
    image: "images/blog1.png",
    link: "https://jsmastery.com/blog/typescript-explained-what-it-is-why-it-matters-and-how-to-master-it",
  },
  {
    id: 2,
    date: "Aug 28, 2025",
    title: "The Ultimate Guide to Mastering Three.js for 3D Development",
    image: "images/blog2.png",
    link: "https://jsmastery.com/blog/the-ultimate-guide-to-mastering-three-js-for-3d-development",
  },
  {
    id: 3,
    date: "Aug 15, 2025",
    title: "The Ultimate Guide to Mastering GSAP Animations",
    image: "images/blog3.png",
    link: "https://jsmastery.com/blog/the-ultimate-guide-to-mastering-gsap-animations",
  },
];

const techStack = [
  {
    category: "Frontend",
    items: ["React.js", "Next.js", "TypeScript"],
  },
  {
    category: "Mobile",
    items: ["React Native", "Expo"],
  },
  {
    category: "Styling",
    items: ["Tailwind CSS", "Sass", "CSS"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Express", "NestJS", "Hono"],
  },
  {
    category: "Database",
    items: ["MongoDB", "PostgreSQL"],
  },
  {
    category: "Dev Tools",
    items: ["Git", "GitHub", "Docker"],
  },
];

const socials = [
  {
    id: 1,
    text: "Github",
    icon: "icons/github.svg",
    bg: "#121415ff",
    link: "https://github.com/vikasaurous",
  },
  {
    id: 2,
    text: "LinkedIn",
    icon: "icons/linkedin.svg",
    bg: "#05b6f6",
    link: "https://www.linkedin.com/in/connectvikasyadav/",
  },
  {
    id: 3,
    text: "Twitter/X",
    icon: "icons/twitter.svg",
    bg: "#000000d7 ",
    link: "https://x.com/vikasaurous",
  },
  {
    id: 4,
    text: "Instagram",
    icon: "icons/instagram-logo.svg",
    bg: "#ea5772ff ",
    link: "https://instagram.com/vikasaurous",
  },
];

export { navLinks, navIcons, dockApps, blogPosts, techStack, socials };

const WORK_LOCATION = {
  id: 1,
  type: "work",
  name: "Work",
  icon: "icons/work.svg",
  kind: "folder",
  children: [
    // ▶ Project — Nutshell AI Text Summarizer
    {
      id: 5,
      name: "Nutshell — AI Text Summarizer",
      icon: "images/folder.png",
      kind: "folder",
      position: "top-10 left-5",
      windowPosition: "top-[5vh] left-5",
      children: [
        {
          id: 1,
          name: "Nutshell.txt",
          icon: "images/txt.png",
          kind: "file",
          fileType: "txt",
          position: "top-5 left-10",
          description: [
            "Nutshell is a full-stack AI-powered text summarization web application built with React.js, Node.js, Express.js, and MongoDB.",
            "It uses the Groq LLM API (Llama 3.1) to condense long-form text into three formats — short summary, detailed breakdown, or bullet points.",
            "Users can register, log in securely with JWT authentication, generate summaries, and revisit their entire summary history.",
            "Additional features include text-to-speech playback, copy to clipboard, file download, dark mode, and a fully responsive Neobrutalism UI built with Tailwind CSS.",
          ],
        },
        {
          id: 2,
          name: "nutshell.com",
          icon: "images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://nutshell-summarizer.vercel.app/",
          position: "top-10 right-20",
        },
        {
          id: 3,
          name: "nutshell_tech.md",
          icon: "images/md.png",
          kind: "file",
          fileType: "txt",
          position: "top-30 left-54",
          description: [
            "⚛️  Frontend: React.js, Tailwind CSS, Vite",
            "🟢  Backend: Node.js, Express.js, REST API",
            "🍃  Database: MongoDB, MongoDB Atlas",
            "🤖  AI Model: Groq API — Llama 3.1 (8B Instant)",
            "🔐  Auth: JWT, Bcrypt",
            "☁️  Deployment: Vercel (Frontend), Render (Backend)",
          ],
        },
        {
          id: 4,
          name: "nutshell.png",
          icon: "images/image.png",
          kind: "file",
          fileType: "img",
          position: "top-52 right-80",
          imageUrl: "images/nutshell-preview.png",
        },
        {
          id: 5,
          name: "github.url",
          icon: "images/github.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vikasaurous/nutshell-text-summarizer",
          position: "top-60 right-20",
        },
      ],
    },
  ],
};

const ABOUT_LOCATION = {
  id: 2,
  type: "about",
  name: "About me",
  icon: "icons/info.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "me.png",
      icon: "images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-10 left-5",
      imageUrl: "images/adrian.jpg",
    },
    {
      id: 2,
      name: "casual-me.png",
      icon: "images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-28 right-72",
      imageUrl: "images/adrian-2.jpg",
    },
    {
      id: 3,
      name: "conference-me.png",
      icon: "images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-52 left-80",
      imageUrl: "images/adrian-3.jpeg",
    },
    {
      id: 4,
      name: "about-me.txt",
      icon: "images/txt.png",
      kind: "file",
      fileType: "txt",
      position: "top-60 left-5 ",
      subtitle: "Meet the Developer Behind the Code",
      image: "images/vikas-cover.png",
      description: [
        "Hey, I’m Vikas 👋 — a CS student who writes code, fixes bugs, and occasionally wonders how it all compiled.",
        "I mostly work with JavaScript, React, and Next.js, trying to build things that don’t break immediately.",
        "I prefer clean UI, simple UX, and code that still makes sense after a long night.",
        "Currently running on caffeine, unfinished side projects, and mild optimism 😅",
      ],
    },
  ],
};

const RESUME_LOCATION = {
  id: 3,
  type: "resume",
  name: "Resume",
  icon: "icons/file.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "Resume.pdf",
      icon: "images/pdf.png",
      kind: "file",
      fileType: "pdf",
      // you can add `href` if you want to open a hosted resume
      // href: "/your/resume/path.pdf",
    },
  ],
};

const TRASH_LOCATION = {
  id: 4,
  type: "trash",
  name: "Trash",
  icon: "icons/trash.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "trash1.png",
      icon: "images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-10 left-10",
      imageUrl: "images/rat-race.jpg",
    },
    {
      id: 2,
      name: "helloworld.html",
      icon: "images/safari.png",
      kind: "file",
      fileType: "txt",
      description: [
        "<!DOCTYPE html>",
        "<html lang='en'>",
        "<head>",
        "  <meta charset='UTF-8'>",
        "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>",
        "  <title>Hello World</title>",
        "</head>",
        "<body>",
        "  <h1>Hello, World!</h1>",
        "  <p>My first Webpage.</p>",
        "</body>",
        "</html>",
      ],
      position: "top-10 right-20",
    },
    {
      id: 3,
      name: "passwords.txt",
      icon: "images/txt.png",
      kind: "file",
      fileType: "img",
      position: "top-60 left-20",
      imageUrl: "images/trash-3.jpg",
    },
  ],
};

export const locations = {
  work: WORK_LOCATION,
  about: ABOUT_LOCATION,
  resume: RESUME_LOCATION,
  trash: TRASH_LOCATION,
};

const INITIAL_Z_INDEX = 1000;

const WINDOW_CONFIG = {
  finder: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  contact: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  resume: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  safari: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  terminal: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  trash: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  txtfile: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  imgfile: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
};

export { INITIAL_Z_INDEX, WINDOW_CONFIG };
