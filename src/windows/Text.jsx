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

      <div className="h-full bg-white dark:bg-gray-800 w-full overflow-hidden flex items-center justify-center p-5">
        <div 
          className={`flex items-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isMaximized 
              ? "gap-20 max-w-6xl w-full px-10 -translate-y-10" 
              : "gap-6 w-full translate-y-0"
          }`}
        >
          {image ? (
            <div 
              className={`flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isMaximized ? "w-[350px]" : "w-1/3"
              }`}
            >
              <img
                src={image}
                alt={name}
                className="w-full h-auto rounded object-cover shadow-lg"
              />
            </div>
          ) : null}

          <div className="flex-1 space-y-5">
            {subtitle ? (
              <h3 className={`font-bold text-gray-900 dark:text-gray-100 transition-all duration-500 ${isMaximized ? "text-4xl" : "text-xl"}`}>
                {subtitle}
              </h3>
            ) : null}

            {Array.isArray(description) && description.length > 0 ? (
              <div className={`space-y-4 leading-relaxed text-gray-700 dark:text-gray-300 transition-all duration-500 ${isMaximized ? "text-xl" : "text-sm"}`}>
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
