import { WindowControl } from "#components";
import { locations } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper";
import useLocationStore from "#store/location";
import useWindowStore from "#store/window";
import useSafariStore from "#store/safari";
import useFinderStore from "#store/finder";
import clsx from "clsx";
import { Search } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

// macOS Finder lays icons out on an invisible grid; dropping snaps to it.
const GRID_WIDTH = 96;
const GRID_HEIGHT = 104;
const DRAG_THRESHOLD = 4;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const cellFor = (x, y) => ({
  column: Math.round(x / GRID_WIDTH),
  row: Math.round(y / GRID_HEIGHT),
});

// When a drop lands on an occupied cell, look for the closest empty one.
const findNearestFreeCell = (column, row, maxColumn, maxRow, occupied) => {
  for (let radius = 1; radius <= 12; radius += 1) {
    let best = null;
    let bestDistance = Infinity;

    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;

        const nextColumn = column + dx;
        const nextRow = row + dy;

        if (nextColumn < 0 || nextRow < 0) continue;
        if (nextColumn > maxColumn || nextRow > maxRow) continue;
        if (occupied.has(`${nextColumn}:${nextRow}`)) continue;

        const distance = dx * dx + dy * dy;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = { column: nextColumn, row: nextRow };
        }
      }
    }

    if (best) return best;
  }

  return { column, row };
};

const Finder = () => {
  const { openWindow } = useWindowStore();
  const { setActiveLocation, activeLocation } = useLocationStore();
  const { positions, initializePositions, setPosition } = useFinderStore();

  const contentRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);

  const [selectedKey, setSelectedKey] = useState(null);
  const [draggingKey, setDraggingKey] = useState(null);

  const openItem = (item) => {
    if (item.fileType === "pdf") return openWindow("resume");
    if (item.kind === "folder") return setActiveLocation(item);
    if (item.fileType === "url" && item.href) {
      useSafariStore.getState().openUrl(item.href);
      openWindow("safari");
      return;
    }
    if (item.fileType === "fig" && item.href)
      return window.open(item.href, "_blank", "noopener,noreferrer");

    openWindow(`${item.fileType}${item.kind}`, item);
  };

  // Measure the CSS-defined starting layout once per folder, then switch to
  // pixel positions so the same icons can be dragged anywhere. The window is
  // mounted even while closed, so hidden icons (clientWidth 0) must be skipped
  // and measured when Finder becomes visible.
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const measure = () => {
      if (!content.clientWidth || !activeLocation?.children) return;

      const entries = [];

      for (const item of activeLocation.children) {
        const key = `${activeLocation.id}:${item.id}`;
        if (positions[key]) continue;

        const element = content.querySelector(`[data-item-key="${key}"]`);
        if (!element) continue;

        entries.push([key, { x: element.offsetLeft, y: element.offsetTop }]);
      }

      if (entries.length) initializePositions(entries);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(content);

    return () => observer.disconnect();
  }, [activeLocation, positions, initializePositions]);

  const handlePointerDown = (event, key) => {
    if (event.button !== 0) return;

    const content = contentRef.current;
    if (!content) return;

    const element = event.currentTarget;
    const contentRect = content.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();

    dragRef.current = {
      pointerId: event.pointerId,
      key,
      element,
      startX: event.clientX,
      startY: event.clientY,
      originX: itemRect.left - contentRect.left,
      originY: itemRect.top - contentRect.top,
      x: itemRect.left - contentRect.left,
      y: itemRect.top - contentRect.top,
      moved: false,
    };

    try {
      element.setPointerCapture?.(event.pointerId);
    } catch {
      // Synthetic pointers (and some touch browsers) cannot be captured.
    }

    setSelectedKey(key);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const content = contentRef.current;
    if (!content) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (!drag.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;

    if (!drag.moved) {
      drag.moved = true;
      setDraggingKey(drag.key);
    }

    const maxX = Math.max(0, content.clientWidth - drag.element.offsetWidth);
    const maxY = Math.max(0, content.clientHeight - drag.element.offsetHeight);

    drag.x = clamp(drag.originX + deltaX, 0, maxX);
    drag.y = clamp(drag.originY + deltaY, 0, maxY);

    // Move the node directly: no React render per pointer event, so dragging
    // stays smooth even with the window and wallpaper compositing.
    drag.element.style.left = `${drag.x}px`;
    drag.element.style.top = `${drag.y}px`;
    drag.element.style.right = "auto";
  };

  const finishDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;

    try {
      drag.element.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be gone (e.g. pointercancel).
    }

    setDraggingKey(null);

    if (!drag.moved) return;

    // A drag also produces a click; swallow that one so the item doesn't open.
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);

    const content = contentRef.current;
    if (!content) return;

    const maxX = Math.max(0, content.clientWidth - drag.element.offsetWidth);
    const maxY = Math.max(0, content.clientHeight - drag.element.offsetHeight);
    const maxColumn = Math.floor(maxX / GRID_WIDTH);
    const maxRow = Math.floor(maxY / GRID_HEIGHT);

    const occupied = new Set();
    const prefix = `${activeLocation.id}:`;

    Object.entries(positions).forEach(([otherKey, position]) => {
      if (otherKey === drag.key || !otherKey.startsWith(prefix)) return;

      const cell = cellFor(position.x, position.y);
      occupied.add(`${cell.column}:${cell.row}`);
    });

    const target = cellFor(drag.x, drag.y);
    let column = clamp(target.column, 0, maxColumn);
    let row = clamp(target.row, 0, maxRow);

    if (occupied.has(`${column}:${row}`)) {
      const free = findNearestFreeCell(column, row, maxColumn, maxRow, occupied);
      column = free.column;
      row = free.row;
    }

    setPosition(drag.key, {
      x: clamp(column * GRID_WIDTH, 0, maxX),
      y: clamp(row * GRID_HEIGHT, 0, maxY),
    });
  };

  const handleItemClick = (event, item) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      event.preventDefault();
      return;
    }

    openItem(item);
  };

  // Clicking bare desktop space deselects, like Finder.
  const handleContentPointerDown = (event) => {
    if (event.target === event.currentTarget) setSelectedKey(null);
  };

  const renderList = (name, items) => (
    <div>
      <h3>{name}</h3>
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => setActiveLocation(item)}
            className={clsx(item.id === activeLocation.id ? "active" : "not-active")}
          >
            <img src={item.icon} alt={item.name} className="w-4 h-4 object-contain" />
            <p className="text-sm font-medium truncate">{item.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <div id="window-header">
        <WindowControl target="finder" />
        <Search size={15} className="icon ml-auto opacity-50" />
      </div>

      {/* Sidebar + Content row fills remaining height */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div className="sidebar">
          {renderList("Favorites", Object.values(locations))}
          {renderList("Work", locations.work.children)}
        </div>
        <ul className="content" ref={contentRef} onPointerDown={handleContentPointerDown}>
          {activeLocation?.children.map((item) => {
            const key = `${activeLocation.id}:${item.id}`;
            const position = positions[key];

            return (
              <li
                key={item.id}
                data-item-key={key}
                className={clsx(
                  item.position,
                  selectedKey === key && "selected",
                  draggingKey === key && "dragging"
                )}
                style={position ? { left: position.x, top: position.y, right: "auto" } : undefined}
                onPointerDown={(event) => handlePointerDown(event, key)}
                onPointerMove={handlePointerMove}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                onClick={(event) => handleItemClick(event, item)}
              >
                <img src={item.icon} alt={item.name} draggable={false} />
                <p>{item.name}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

const FinderWindow = WindowWrapper(Finder, "finder");
export default FinderWindow;
