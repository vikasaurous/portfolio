import { WindowControl } from "#components";
import { gallery, photosLinks } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper";
import useWindowStore from "#store/Window";
import { Mail, Search } from "lucide-react";

const Photos = ({ isMaximized }) => {
  const { openWindow } = useWindowStore();
  return (
    <>
      <div id="window-header">
        <WindowControl target="photos" />
        <div className="w-full flex justify-end items-center gap-3 text-gray-500">
          <Mail className="icon" />
          <Search className="icon" />
        </div>
      </div>

      <div className="flex w-full">
        <div className="sidebar">
          <h2>Photos</h2>
          <ul>
            {photosLinks.map(({ id, icon, title }) => (
              <li key={id}>
                <img src={icon} alt={title} />
                <p>{title}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="gallery">
          <ul className={`gap-3 space-y-3 w-full transition-all duration-500 ease-in-out ${isMaximized ? "columns-3" : "columns-2"}`}>
            {gallery.map(({ id, img }) => (
              <li
                key={id}
                onClick={() =>
                  openWindow("imgfile", {
                    id,
                    name: "Gallery Image",
                    icon: "/images/image.png",
                    kind: "file",
                    fileType: "img",
                    imageUrl: img,
                  })
                }
              >
                <img src={img} alt={`Gallery image ${id}`} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

const PhotosWindow = WindowWrapper(Photos, "photos");
export default PhotosWindow;
