import dayjs from "dayjs";
import { navIcons, navLinks } from "#constants";
import { useEffect, useState } from "react";


// todo: fix font sizes
const Navbar = () => {
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
          {navLinks.map(({ id, name }) => (
            <li key={id}>
              <p>{name}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <ul>
          {navIcons.map(({ id, img }) => (
            <li key={id}>
              <img src={img} className="icon-hover" alt={`icon-${id}`} />
            </li>
          ))}
        </ul>

        <time className="tabular-nums">{formattedTime}</time>
      </div>
    </nav>
  );
};

export default Navbar;
