/**
 * commands.js — Terminal Command Registry
 *
 * Each command is a function: (args: string[], ctx: Context) => Response
 *
 * Context shape:
 *   { commandHistory: string[], theme: string }
 *
 * Response shapes:
 *   { type: "text",   content: string | string[] }
 *   { type: "error",  content: string }
 *   { type: "clear" }
 *   { type: "action", action: string, payload: object }
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

const text = (content) => ({ type: "text", content });
const err = (content) => ({ type: "error", content });
const action = (act, payload = {}) => ({
  type: "action",
  action: act,
  payload,
});

const PROMPT_USER = "vikas";
const PROMPT_HOST = "portfolio";

// ─── Command Implementations ─────────────────────────────────────────────────

const help = () =>
  text([
    "Available Commands:",
    "",
    "  General",
    "    help          Show this help message",
    "    clear         Clear the terminal",
    "    echo <text>   Print text to terminal",
    "    date          Show current date & time",
    "    history       Show command history",
    "    pwd           Print working directory",
    "    ls            List files in current directory",
    "    cat <file>    Read a file",
    "    banner        Show the welcome banner",
    "    neofetch      System information",
    "    theme         Show current theme",
    "",
    "  Portfolio",
    "    whoami        About Vikas",
    "    about         Detailed bio",
    "    skills        Tech stack",
    "    projects      Project list",
    "    experience    Work experience",
    "    education     Education background",
    "",
    "  Actions",
    "    resume        Download resume",
    "    github        Open GitHub profile",
    "    linkedin      Open LinkedIn profile",
    "    contact       Open contact window",
    "    email         Open email client",
    "    sudo hire-vikas  Make the smart choice 😄",
  ]);

const whoami = () =>
  text([
    "vikas — Full-Stack Developer & CS Student",
    "",
    "I build things for the web (and sometimes break them first).",
    "Currently running on caffeine, React, and mild optimism.",
  ]);

const about = () =>
  text([
    "╭─────────────────────────────────────────╮",
    "│           About Vikas Yadav             │",
    "╰─────────────────────────────────────────╯",
    "",
    "  Hey, I'm Vikas 👋",
    "  CS Student · Full-Stack Developer · Open to Work",
    "",
    "  I mostly work with JavaScript, React, and Next.js,",
    "  trying to build things that don't break immediately.",
    "",
    "  I prefer clean UI, simple UX, and code that still",
    "  makes sense after a long night.",
    "",
    "  Currently running on caffeine, unfinished side",
    "  projects, and mild optimism 😅",
  ]);

const skills = () =>
  text([
    "╭─────────────────────────────────────────╮",
    "│               Tech Stack                │",
    "╰─────────────────────────────────────────╯",
    "",
    "  Frontend     React.js · Next.js · TypeScript",
    "  Mobile       React Native · Expo",
    "  Styling      Tailwind CSS · Sass · CSS",
    "  Backend      Node.js · Express · NestJS · Hono",
    "  Database     MongoDB · PostgreSQL",
    "  Dev Tools    Git · GitHub · Docker",
    "",
    "  ✓  5 / 5 stacks loaded  (100%)",
  ]);

const projects = () =>
  text([
    "╭─────────────────────────────────────────╮",
    "│               Projects                  │",
    "╰─────────────────────────────────────────╯",
    "",
    "  1.  Nutshell — AI Text Summarizer",
    "      React · Node.js · MongoDB · Groq LLM",
    "      → https://nutshell-summarizer.vercel.app",
    "",
    '  Tip: type "contact" to get in touch about a project.',
  ]);

const experience = () =>
  text([
    "╭─────────────────────────────────────────╮",
    "│              Experience                 │",
    "╰─────────────────────────────────────────╯",
    "",
    "  Currently building personal projects and",
    "  contributing to open-source.",
    "",
    "  Open to internship & full-time opportunities.",
    '  → Type "contact" or "email" to reach out.',
  ]);

const education = () =>
  text([
    "╭─────────────────────────────────────────╮",
    "│              Education                  │",
    "╰─────────────────────────────────────────╯",
    "",
    "  Master Of Compter Applications",
    "  Currently pursuing · Expected graduation 2027",
    "",
    "  Key subjects: DSA · OS · DBMS · Networking",
    "  Side subjects: Sleep deprivation · Debug marathons",
  ]);

const resume = () =>
  action("openLink", {
    href: `${import.meta.env.BASE_URL}files/resume.pdf`,
    label: "Downloading resume...",
  });

const github = () =>
  action("openLink", {
    href: "https://github.com/vikasaurous",
    label: "Opening GitHub profile...",
  });

const linkedin = () =>
  action("openLink", {
    href: "https://www.linkedin.com/in/connectvikasyadav/",
    label: "Opening LinkedIn profile...",
  });

const contact = () =>
  action("openWindow", {
    windowKey: "contact",
    message: "Opening contact window...",
  });

const email = () =>
  action("openLink", {
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=vikas.yadav.connect@gmail.com",
    label: "Opening email client...",
  });

const sudoHireVikas = () =>
  action("openWindow", {
    windowKey: "contact",
    message: "sudo hire-vikas executed. Opening contact form...",
  });

const clear = () => ({ type: "clear" });

const pwd = () => text(`/home/${PROMPT_USER}/portfolio`);

const ls = () =>
  text([
    "about-me.txt    resume.pdf    projects/",
    "skills.md       contact.txt   github.url",
  ]);

const cat = (args) => {
  const file = args[0];
  const files = {
    "about-me.txt":
      'Hey, I\'m Vikas. CS student, full-stack dev.\nRun "about" for more.',
    "resume.pdf": 'Binary file — run "resume" to download.',
    "contact.txt": "vikas.yadav.connect@gmail.com\ngithub.com/vikasaurous",
    "skills.md":
      "# Tech Stack\nFrontend: React, Next.js\nBackend: Node.js, Express\nDB: MongoDB, PostgreSQL",
    "github.url": "https://github.com/vikasaurous",
  };

  if (!file) return err("cat: missing file operand");
  if (!files[file]) return err(`cat: ${file}: No such file or directory`);
  return text(files[file]);
};

const echo = (args) => (args.length === 0 ? text("") : text(args.join(" ")));

const date = () => text(new Date().toString());

const neofetch = () =>
  text([
    "                    vikas@portfolio",
    "  ╔══════════════╗  ─────────────────────────",
    "  ║  macOS-like  ║  OS:       Portfolio OS 1.0",
    "  ║   Portfolio  ║  Host:     Browser",
    "  ║              ║  Shell:    zsh (simulated)",
    "  ║   Built with ║  DE:       macOS-inspired",
    "  ║    React ⚛️  ║  Theme:    Dark / Light",
    "  ╚══════════════╝  Terminal:  vikas-term 1.0",
    "                    CPU:       Caffeine-powered",
    "                    Memory:    Infinite ambition",
  ]);

const banner = () =>
  text([
    "██╗   ██╗██╗██╗  ██╗ █████╗ ███████╗",
    "██║   ██║██║██║ ██╔╝██╔══██╗██╔════╝",
    "██║   ██║██║█████╔╝ ███████║███████╗",
    "╚██╗ ██╔╝██║██╔═██╗ ██╔══██║╚════██║",
    " ╚████╔╝ ██║██║  ██╗██║  ██║███████║",
    "  ╚═══╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝",
    "",
    "  Welcome to Vikas's Interactive Portfolio Terminal",
    '  Type "help" to see available commands.',
  ]);

const historyCmd = (args, ctx) => {
  if (!ctx.commandHistory || ctx.commandHistory.length === 0)
    return text("No commands in history.");
  // Reverse so oldest commands appear first — matches real zsh `history` output
  const ordered = [...ctx.commandHistory].reverse();
  return text(
    ordered.map((cmd, i) => `  ${String(i + 1).padStart(3)}  ${cmd}`),
  );
};

const theme = (args, ctx) => text(`Current theme: ${ctx.theme ?? "system"}`);

// ─── Registry ─────────────────────────────────────────────────────────────────
// To add a new command: add one entry here. Terminal.jsx never changes.

const commands = {
  help,
  whoami,
  about,
  skills,
  projects,
  experience,
  education,
  resume,
  github,
  linkedin,
  contact,
  email,
  clear,
  pwd,
  ls,
  cat,
  echo,
  date,
  neofetch,
  banner,
  history: historyCmd,
  theme,
  // sudo alone — give a helpful hint rather than generic "command not found"
  sudo: () => err('sudo: try "sudo hire-vikas" 😄'),
  "sudo hire-vikas": sudoHireVikas,
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Execute a raw input string.
 * Returns a standardised response object.
 */
export function executeCommand(rawInput, ctx = {}) {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // Special multi-word commands before generic split
  if (trimmed === "sudo hire-vikas") {
    return commands["sudo hire-vikas"]([], ctx);
  }

  const tokens = trimmed.split(/\s+/);
  const cmd = tokens[0].toLowerCase();
  const args = tokens.slice(1);

  const handler = commands[cmd];
  if (!handler) {
    return err(`zsh: command not found: ${cmd}`);
  }

  return handler(args, ctx);
}

/** All registered command names — used for Tab autocomplete. */
export const commandNames = Object.keys(commands);
