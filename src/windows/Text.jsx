import { WindowControl } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import useWindowStore from "#store/Window";
import React from "react";

const Text = ({ isMaximized }) => {
  const { windows } = useWindowStore();
  const data = windows.txtfile?.data;

  if (!data) return null;

  const { name, image, subtitle, description } = data;
  return (
    <>
      <div id="window-header">
        <WindowControl target="txtfile" />
        <h2>{name}</h2>
      </div>

      <div
        className={`p-5 bg-white h-full transition-all duration-300 ease-in-out ${
          isMaximized
            ? "flex flex-row items-center gap-16 justify-center px-20 pt-1"
            : "flex flex-row gap-5 items-center overflow-y-auto"
        }`}
      >
        {image ? (
          <div className={isMaximized ? "w-auto flex-shrink-0" : "w-1/3 flex-shrink-0"}>
            <img
              src={image}
              alt={name}
              className={`rounded transition-all duration-300 ease-in-out ${
                isMaximized
                  ? "w-80 h-auto object-cover shadow-2xl"
                  : "w-full h-auto object-cover"
              }`}
            />
          </div>
        ) : null}

        <div className={isMaximized ? "max-w-xl space-y-6" : "flex-1 space-y-3"}>
          {subtitle ? (
            <h3 className={`font-bold text-gray-900 ${isMaximized ? "text-3xl" : "text-lg"}`}>{subtitle}</h3>
          ) : null}

          {Array.isArray(description) && description.length > 0 ? (
            <div className={`space-y-4 leading-relaxed text-gray-700 ${isMaximized ? "text-lg" : "text-sm"}`}>
              {description.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const TextWindow = WindowWrapper(Text, "txtfile");
export default TextWindow;
