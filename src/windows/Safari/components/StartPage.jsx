import { locations } from '#constants';
import useSafariStore from '#store/safari';
import useWindowStore from '#store/window';
import { ExternalLink, Github } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Derive structured project info from the existing location data
const deriveProjects = () =>
  (locations.work?.children ?? []).map((project) => {
    const kids = project.children ?? [];
    const liveUrl  = kids.find((c) => c.fileType === 'url' && !c.name.toLowerCase().includes('github'))?.href ?? '';
    const githubUrl = kids.find((c) => c.fileType === 'url' && c.name.toLowerCase().includes('github'))?.href ?? '';
    const imageUrl  = kids.find((c) => c.fileType === 'img')?.imageUrl ?? '';
    const desc      = kids.find((c) => c.fileType === 'txt' && Array.isArray(c.description))?.description?.[0] ?? '';
    return { id: project.id, name: project.name, liveUrl, githubUrl, imageUrl, desc };
  });

const FAVORITES = [
  {
    id: 'portfolio',
    name: 'Portfolio',
    icon: 'images/finder.png',
    action: 'url',
    value: 'https://vikasaurous.github.io/portfolio/',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'icons/github.svg',
    action: 'url',
    value: 'https://github.com/vikasaurous',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'icons/linkedin.svg',
    action: 'url',
    value: 'https://www.linkedin.com/in/connectvikasyadav/',
  },
  {
    id: 'resume',
    name: 'Resume',
    icon: 'images/pdf.png',
    action: 'window',
    value: 'resume',
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: 'images/contact.png',
    action: 'window',
    value: 'contact',
  },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const FavoriteItem = ({ fav, onUrl, onWindow }) => (
  <button
    onClick={() => fav.action === 'url' ? onUrl(fav.value) : onWindow(fav.value)}
    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors group cursor-pointer"
    aria-label={`Open ${fav.name}`}
  >
    <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-white dark:bg-[#2c2c2e] shadow-sm group-hover:shadow transition-shadow">
      <img
        src={fav.icon}
        alt={fav.name}
        className="w-8 h-8 object-contain dark:invert"
        draggable={false}
      />
    </div>
    <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium text-center leading-tight max-w-[64px] truncate">
      {fav.name}
    </span>
  </button>
);

const ProjectCard = ({ project, onUrl }) => (
  <div className="flex gap-4 p-4 bg-white dark:bg-[#2c2c2e] rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group">
    {/* Preview */}
    {project.imageUrl && (
      <div className="w-[72px] h-[50px] rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-[#3a3a3c]">
        <img
          src={project.imageUrl}
          alt={project.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    )}

    {/* Info */}
    <div className="flex-1 min-w-0">
      <h3 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate mb-0.5">
        {project.name}
      </h3>
      {project.desc && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
          {project.desc}
        </p>
      )}
    </div>

    {/* Actions */}
    <div className="flex items-center gap-1.5 shrink-0 self-center">
      {project.liveUrl && (
        <button
          onClick={() => onUrl(project.liveUrl)}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
          aria-label={`Open ${project.name} live demo`}
        >
          <ExternalLink className="w-3 h-3" />
          Open
        </button>
      )}
      {project.githubUrl && (
        <button
          onClick={() => onUrl(project.githubUrl)}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 dark:bg-[#3a3a3c] hover:bg-gray-200 dark:hover:bg-[#48484a] text-gray-700 dark:text-gray-300 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
          aria-label={`Open ${project.name} on GitHub`}
        >
          <Github className="w-3 h-3" />
          GitHub
        </button>
      )}
    </div>
  </div>
);

// ─── Start Page ───────────────────────────────────────────────────────────────

const StartPage = () => {
  const openUrl = useSafariStore((s) => s.openUrl);
  const { openWindow } = useWindowStore();
  const projects = deriveProjects();

  return (
    <div className="h-full overflow-y-auto overscroll-contain bg-[#f2f2f7] dark:bg-[#1c1c1e]">
      <div className="max-w-[640px] mx-auto px-8 py-10 pb-16">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight">
            {greeting()} 👋
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            Choose where you'd like to explore.
          </p>
        </div>

        {/* Favorites */}
        <section className="mb-8">
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
            ⭐ Favorites
          </p>
          <div className="grid grid-cols-5 gap-1">
            {FAVORITES.map((fav) => (
              <FavoriteItem
                key={fav.id}
                fav={fav}
                onUrl={openUrl}
                onWindow={openWindow}
              />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 mb-8" />

        {/* Featured Projects */}
        {projects.length > 0 && (
          <section>
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
              🚀 Featured Projects
            </p>
            <div className="space-y-2.5">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onUrl={openUrl} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default StartPage;
