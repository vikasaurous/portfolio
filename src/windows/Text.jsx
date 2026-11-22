import { WindowControl } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import useWindowStore from "#store/window";
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
        style={{ flex: 1, overflow: "auto" }}
        className="flex items-center justify-center p-6"
      >
        <div
          className={`flex items-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isMaximized
              ? "gap-16 max-w-5xl w-full px-8"
              : "gap-6 w-full"
          }`}
        >
          {image ? (
            <div
              className={`flex-shrink-0 transition-all duration-300 ${
                isMaximized ? "w-72" : "w-1/3"
              }`}
            >
              <img
                src={image}
                alt={name}
                className="w-full h-auto rounded-lg object-cover shadow-xl"
              />
            </div>
          ) : null}

          <div className="flex-1 space-y-4">
            {subtitle ? (
              <h3
                className={`font-bold leading-tight transition-all duration-300 ${
                  isMaximized ? "text-3xl" : "text-xl"
                }`}
              >
                {subtitle}
              </h3>
            ) : null}

            {Array.isArray(description) && description.length > 0 ? (
              <div
                className={`space-y-3 leading-relaxed transition-all duration-300 ${
                  isMaximized ? "text-lg" : "text-sm"
                }`}
              >
                {description.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

const TextWindow = WindowWrapper(Text, "txtfile");
export default TextWindow;
