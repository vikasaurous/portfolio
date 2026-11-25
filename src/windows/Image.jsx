import { WindowControl } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import useWindowStore from "#store/window";
import React from "react";

const ImageWindowContent = () => {
  const data = useWindowStore((s) => s.windows.imgfile?.data);

  const { name, imageUrl } = data ?? {};
  return (
    <>
      <div id="window-header">
        <WindowControl target="imgfile" />
        <h2>{name ?? ""}</h2>
      </div>

      {data ? (
        <div className="preview">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name ?? ""}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
};

const ImageWindow = WindowWrapper(ImageWindowContent, "imgfile");
export default ImageWindow;
