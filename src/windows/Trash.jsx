import { locations } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper";
import useLocationStore from "#store/location";
import useWindowStore from "#store/window";
import { useEffect } from "react";


const Trash = () => {
  const isTrashOpen = useWindowStore((s) => s.windows.trash.isOpen);
  const openWindow = useWindowStore((s) => s.openWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const setActiveLocation = useLocationStore((s) => s.setActiveLocation);

  useEffect(() => {
    if (!isTrashOpen) return;

    const { windows } = useWindowStore.getState();
    const { activeLocation } = useLocationStore.getState();
    const trashOriginRect = windows.trash.originRect;

    if (windows.finder.isOpen && activeLocation.id === locations.trash.id) {
      closeWindow("finder");
    } else {
      setActiveLocation(locations.trash);
      openWindow("finder", null, trashOriginRect);
    }
    closeWindow("trash");
  }, [isTrashOpen, openWindow, closeWindow, setActiveLocation]);

  return null;
};

const TrashWindow = WindowWrapper(Trash, "trash");
export default TrashWindow;
