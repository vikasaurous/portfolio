import { locations } from "#constants";
import useLocationStore from "#store/location";
import useWindowStore from "#store/window";
import { prefetchWindow } from "#windows/loaders.js";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";
import { Draggable } from "gsap/Draggable";
import React, { useRef } from "react";

const Home = () => {
  const homeRef = useRef(null);
  const draggingRef = useRef(false);
  const setActiveLocation = useLocationStore((s) => s.setActiveLocation);
  const openWindow = useWindowStore((s) => s.openWindow);

  const projects = locations.work?.children ?? [];
  const projectKey = projects.map((p) => p.id).join(",");

  const handleOpenProjectFinder = (project) => {
    setActiveLocation(project);
    openWindow("finder");
  };

  useGSAP(
    () => {
      const folders = homeRef.current?.querySelectorAll(".folder");
      if (!folders?.length) return;

      // Recreate Draggable instances whenever the project list changes (e.g. HMR or dynamic updates)
      // and clean them up so every rendered folder stays draggable without duplicate bindings.
      const instances = Draggable.create(folders, {
        onDragStart() {
          draggingRef.current = true;
        },
        onDragEnd() {
          setTimeout(() => {
            draggingRef.current = false;
          }, 0);
        },
      });

      return () => {
        instances.forEach((instance) => instance.kill());
      };
    },
    { scope: homeRef, dependencies: [projectKey] }
  );

  return (
    <section id="home" ref={homeRef}>
      <ul>
        {projects.map((project) => (
          <li
            key={project.id}
            role="button"
            tabIndex={0}
            aria-label={`Open ${project.name} in Finder`}
            className={clsx("group folder", project.windowPosition)}
            onMouseEnter={() => prefetchWindow("finder")}
            onFocus={() => prefetchWindow("finder")}
            onClick={() => {
              if (draggingRef.current) return;
              handleOpenProjectFinder(project);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenProjectFinder(project);
              }
            }}
          >
            <img src="images/folder.png" alt={project.name} draggable={false} />
            <p>{project.name}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Home;
