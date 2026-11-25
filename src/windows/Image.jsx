import { WindowControl } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import useWindowStore from "#store/window";
import React from "react";

export const ImageBody = () => {
  const data = useWindowStore((s) => s.windows.imgfile?.data);
  if (!data) return null;

  const { name, imageUrl } = data;
  return (
    <div className="preview">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name ?? ""}
        />
      ) : null}
    </div>
  );
};

const ImageWindowContent = () => {
  const name = useWindowStore((s) => s.windows.imgfile?.data?.name);

  return (
    <>
      <div id="window-header">
        <WindowControl target="imgfile" />
        <h2>{name ?? ""}</h2>
      </div>

      <ImageBody />
    </>
  );
};

const ImageWindow = WindowWrapper(ImageWindowContent, "imgfile");
export default ImageWindow;
