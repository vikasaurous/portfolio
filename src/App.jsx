import { Draggable } from "gsap/Draggable";
import gsap from "gsap";

import { useEffect } from "react";
import { Dock, Home, Navbar, Welcome } from "#components";
import {
  Contact,
  Finder,
  Image,
  Photos,
  Resume,
  Safari,
  Terminal,
  Text,
} from "#windows";

gsap.registerPlugin(Draggable);

const App = () => {
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleDragStart = (e) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <main className="select-none">
      {/* Navigation */}
      <Navbar />

      {/* Hero */}
      <Welcome />

      {/* Main Content */}
      <Home />

      {/* Apps/Windows */}
      <Terminal />
      <Safari />
      <Resume />
      <Finder />
      <Text />
      <Image />
      <Photos />
      <Contact />

      {/* Fixed UI */}
      <Dock />
    </main>
  );
};

export default App;
