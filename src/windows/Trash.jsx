import { locations } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper";
import useLocationStore from "#store/location";
import useWindowStore from "#store/window";
import { useEffect } from "react";


const Trash = () => {
  const { setActiveLocation, activeLocation } = useLocationStore();
  const { openWindow, closeWindow, windows } = useWindowStore();

  useEffect(() => {
    if (windows.trash.isOpen) {
      if (windows.finder.isOpen && activeLocation.id === locations.trash.id) {
        closeWindow("finder");
      } else {
        setActiveLocation(locations.trash);
        openWindow("finder");
      }
      closeWindow("trash");
    }
  }, [windows.trash.isOpen]);

  return null;
};

const TrashWindow = WindowWrapper(Trash, "trash");
export default TrashWindow;
