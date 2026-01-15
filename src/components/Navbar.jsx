import dayjs from "dayjs";
import { navIcons, navLinks, locations } from "#constants";
import { useEffect, useState, useRef } from "react";
import useWindowStore from "#store/Window";

const Navbar = () => {
  const { openWindow, closeWindow, windows } = useWindowStore();

  const [currentTime, setCurrentTime] = useState(dayjs());
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const wifiRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wifiRef.current && !wifiRef.current.contains(event.target)) {
        setIsWifiOpen(false);
      }
    };

    if (isWifiOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isWifiOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.format("ddd MMM D h:mm:ss A");

  return (
    <nav>
      <div>
        <img src="/images/logo.svg" alt="apple logo" />
        <p className="font-bold">Vikas's Portfolio</p>

        <ul>
          {navLinks.map(({ id, name, type }) => (
            <li key={id} onClick={() => openWindow(type)}>
              <p>{name}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <ul>
          {navIcons.map(({ id, img, name }) => {
            const isWifi = id === 1;
            const showTooltip = !isWifi || !isWifiOpen;

            return (
              <li
                key={id}
                ref={isWifi ? wifiRef : null}
                className={`relative group ${isWifi ? "" : ""}`}
                onClick={() => {
                  if (id === 3) {
                    const aboutFile = locations.about.children.find(
                      (child) => child.name === "about-me.txt"
                    );
                    if (aboutFile) {
                      if (
                        windows.txtfile.isOpen &&
                        windows.txtfile.data?.name === "about-me.txt"
                      ) {
                        closeWindow("txtfile");
                      } else {
                        openWindow("txtfile", aboutFile);
                      }
                    }
                  }
                  if (isWifi) {
                    setIsWifiOpen(!isWifiOpen);
                  }
                }}
              >
                <img
                  src={img}
                  className="icon-hover cursor-pointer"
                  alt={`icon-${id}`}
                />

                {showTooltip && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-black/80 backdrop-blur text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {name}
                  </div>
                )}

                {isWifi && (
                  <>
                    <div className="absolute top-0 right-0 size-2 bg-green-500 rounded-full border-2 border-white/50 animate-pulse" />

                    {isWifiOpen && (
                      <div
                        className="absolute top-9 -right-2 w-64 bg-white/80 backdrop-blur-2xl shadow-2xl rounded-xl p-4 border border-white/20 z-[99999] animate-in fade-in zoom-in-95 duration-200 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                      >
                       <div className="absolute -top-2 right-4 w-0 h-0
                        border-l-[8px] border-l-transparent
                        border-r-[8px] border-r-transparent
                        border-b-[8px] border-b-white/70
                        drop-shadow-sm"/>
                        <ul className="flex flex-col -space-y-3 text-left items-start">
                          {[
                            "Available (mostly)",
                            "Currently learning & building",
                            "Open to work",
                          ].map((item) => (
                            <li
                              key={item}
                              className="text-xs text-gray-600 font-medium flex items-center gap-2"
                            >
                              <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>

        <time className="tabular-nums">{formattedTime}</time>
      </div>
    </nav>
  );
};

export default Navbar;
