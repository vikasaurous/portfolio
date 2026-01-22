import { WindowControl } from "#components";
import { blogPosts } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper";
import useWindowStore from "#store/window";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MoveRight,
  PanelLeft,
  Plus,
  RotateCw,
  Search,
  Share,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";

const Safari = () => {
  const { windows } = useWindowStore();
  const [currentUrl, setCurrentUrl] = useState(null);
  const [displayUrl, setDisplayUrl] = useState("");

  // Listen for data changes from the store (when opening a project)
  useEffect(() => {
    const data = windows.safari?.data;
    if (data?.url) {
      setCurrentUrl(formatUrl(data.url));
      setDisplayUrl(data.url);
    }
  }, [windows.safari?.data]);

  const formatUrl = (url) => {
    if (!url) return null;
    let finalUrl = url;
    
    // Simple YouTube embed transformation
    if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
      try {
        let videoId = "";
        if (url.includes("youtu.be")) {
          videoId = url.split("youtu.be/")[1].split("?")[0];
        } else {
          videoId = new URLSearchParams(new URL(url).search).get("v");
        }
        if (videoId) {
          finalUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      } catch (e) {
        console.error("Error parsing YouTube URL", e);
      }
    }
    return finalUrl;
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      let url = displayUrl;
      if (!url) return;
      
      // Basic URL fuzzy fixing
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        if (url.includes(".") && !url.includes(" ")) {
           url = "https://" + url;
        } else {
           // Fallback to a search engine if it's likely a query
           // Note: Bing Allows embedding in some cases, Google does not.
           // For now, let's just try to treat it as a URL or show it in the iframe (which might fail)
           // or maybe alert the user "Search is not fully supported in this demo".
           // But let's try to assume it's a website.
           url = "https://" + url;
        }
      }
      setCurrentUrl(formatUrl(url));
    }
  };

  return (
    <>
      <div id="window-header">
        <WindowControl target="safari" />

        <PanelLeft className="ml-10 icon" />

        <div className="flex items-center gap-1 ml-5">
          <ChevronLeft className="icon" onClick={() => setCurrentUrl(null)} />
          <ChevronRight className="icon" />
        </div>

        <div className="flex-1 flex-center gap-3">
          <Shield className="icon" />

          <div className="search">
            <Search className="icon" />
            <input
              type="text"
              placeholder="Search or enter website name"
              className="flex-1 bg-transparent outline-none"
              value={displayUrl}
              onChange={(e) => setDisplayUrl(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <Share className="icon" />
          <Plus className="icon" />
          <Copy className="icon" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative w-full h-full bg-white">
        {currentUrl ? (
          <iframe
            src={currentUrl}
            title="Safari Browser"
            className="w-full h-[85vh] border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="blog h-[85vh] overflow-y-auto">
            <h2>My Developer Blogs</h2>

            <div className="space-y-8">
              {blogPosts.map(({ id, image, title, date, link }) => (
                <div key={id} className="blog-post">
                  <div className="col-span-2">
                    <img src={image} alt={title} />
                  </div>

                  <div className="content">
                    <p>{date}</p>
                    <h3>{title}</h3>
                    <a href={link} target="_blank" rel="noopener norefferer">
                      Check out the full post <MoveRight className="icon-hover" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
const SafariWindow = WindowWrapper(Safari, "safari");

export default SafariWindow;
