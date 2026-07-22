import { Globe, ExternalLink, Home, ChevronLeft } from 'lucide-react';
import useSafariStore from '#store/safari';

const ErrorView = ({ url }) => {
  const goBack = useSafariStore((s) => s.goBack);
  const goHome = useSafariStore((s) => s.goHome);

  const displayHost = (() => {
    try { return new URL(url).hostname; }
    catch { return url || 'this page'; }
  })();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#f2f2f7] dark:bg-[#1c1c1e] p-10 select-none">

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#2c2c2e] flex items-center justify-center shadow-sm mb-5">
        <Globe className="w-8 h-8 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h2 className="text-[17px] font-semibold text-gray-900 dark:text-gray-100 mb-1.5 text-center">
        Safari Can't Open This Page
      </h2>

      {/* Host */}
      <p className="text-[13px] text-blue-500 dark:text-blue-400 mb-3 font-mono truncate max-w-xs text-center">
        {displayHost}
      </p>

      {/* Description */}
      <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-8 text-center max-w-sm leading-[1.5]">
        This website prevents itself from being displayed inside another app.
        You can open it directly in your browser instead.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition-colors cursor-pointer"
          aria-label="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open in New Tab
        </button>

        <button
          onClick={goBack}
          className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#2c2c2e] hover:bg-gray-100 dark:hover:bg-[#3a3a3c] text-gray-700 dark:text-gray-300 text-[13px] font-medium rounded-lg border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Go Back
        </button>

        <button
          onClick={goHome}
          className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#2c2c2e] hover:bg-gray-100 dark:hover:bg-[#3a3a3c] text-gray-700 dark:text-gray-300 text-[13px] font-medium rounded-lg border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
          aria-label="Return home"
        >
          <Home className="w-3.5 h-3.5" />
          Home
        </button>
      </div>
    </div>
  );
};

export default ErrorView;
