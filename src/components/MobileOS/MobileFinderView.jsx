import { ChevronLeft, FolderOpen } from "lucide-react";
import { locations } from "#constants";
import useLocationStore from "#store/location";
import useWindowStore from "#store/window";
import useSafariStore from "#store/safari";

const ROOT_LOCATIONS = Object.values(locations);
const ROOT_IDS = new Set(ROOT_LOCATIONS.map((loc) => loc.id));

const FULL_BLEED_ICONS = new Set([
  "images/folder.png",
  "images/txt.png",
  "images/image.png",
]);

const getFinderIconClass = (icon) =>
  FULL_BLEED_ICONS.has(icon) ? "size-10" : "size-12";

const MobileFinderView = () => {
  const activeLocation = useLocationStore((s) => s.activeLocation);
  const setActiveLocation = useLocationStore((s) => s.setActiveLocation);
  const openWindow = useWindowStore((s) => s.openWindow);

  const items = activeLocation?.children ?? [];
  const isSubfolder = activeLocation && !ROOT_IDS.has(activeLocation.id);

  // Determine which root pill appears active (project subfolders belong under Work)
  const activeRootId = isSubfolder ? locations.work.id : activeLocation?.id;

  const openItem = (item) => {
    if (item.fileType === "pdf") {
      return openWindow("resume");
    }
    if (item.kind === "folder") {
      return setActiveLocation(item);
    }
    if (["fig", "url"].includes(item.fileType) && item.href) {
      if (item.fileType === "url") {
        useSafariStore.getState().openUrl(item.href);
        return openWindow("safari");
      }
      return window.open(item.href, "_blank", "noopener,noreferrer");
    }
    openWindow(`${item.fileType}${item.kind}`, item);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[var(--lg-pane-bg)]">
      {/* iOS Files Location Pills */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--lg-separator)] overflow-x-auto shrink-0"
        role="tablist"
        aria-label="Files locations"
      >
        {ROOT_LOCATIONS.map((loc) => {
          const isActive = activeRootId === loc.id;
          return (
            <button
              key={loc.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveLocation(loc)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                isActive
                  ? "bg-blue-500 text-white border-blue-400/50 shadow-sm"
                  : "bg-[var(--lg-pill-bg)] text-[var(--lg-text-secondary)] border-[var(--lg-separator)]"
              }`}
            >
              <img src={loc.icon} alt="" aria-hidden="true" className="size-3.5 object-contain" />
              <span>{loc.name}</span>
            </button>
          );
        })}
      </div>

      {/* Subfolder Breadcrumb Header (e.g. Work -> Nutshell) */}
      {isSubfolder && (
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-[var(--lg-separator)] bg-black/[0.02] dark:bg-white/[0.03] shrink-0">
          <button
            type="button"
            onClick={() => setActiveLocation(locations.work)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-transparent border-0 p-0 cursor-pointer min-h-[32px]"
          >
            <ChevronLeft className="size-4" />
            <span>{locations.work.name}</span>
          </button>
          <span className="text-xs font-semibold text-[var(--lg-text-primary)] truncate">
            {activeLocation.name}
          </span>
        </div>
      )}

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2 text-[var(--lg-text-muted)]">
            <FolderOpen className="size-9 opacity-45" />
            <p className="text-sm font-medium">This folder is empty</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openItem(item)}
                  className="lg-card w-full min-h-[112px] p-3.5 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <span className="size-12 flex items-center justify-center shrink-0">
                    <img
                      src={item.icon}
                      alt=""
                      aria-hidden="true"
                      className={`${getFinderIconClass(item.icon)} object-contain drop-shadow-sm`}
                    />
                  </span>
                  <span className="text-xs font-medium text-[var(--lg-text-primary)] leading-snug line-clamp-2 break-words w-full">
                    {item.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MobileFinderView;
