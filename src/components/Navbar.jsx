import dayjs from "dayjs";
import { navIcons, navLinks, locations } from "#constants";
import { useEffect, useState } from "react";
import useWindowStore from "#store/Window";

const Navbar = () => {
  const { openWindow, closeWindow, windows } = useWindowStore(); 

  const [currentTime, setCurrentTime] = useState(dayjs());

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
          {navIcons.map(({ id, img }) => (
            <li
              key={id}
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
              }}
            >
              <img src={img} className="icon-hover cursor-pointer" alt={`icon-${id}`} />
            </li>
          ))}
        </ul>

        <time className="tabular-nums">{formattedTime}</time>
      </div>
    </nav>
  );
};

export default Navbar;
