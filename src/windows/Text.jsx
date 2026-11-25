import { WindowControl } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import useWindowStore from "#store/window";
import React from "react";

export const TextBody = ({ isMaximized = false }) => {
  const data = useWindowStore((s) => s.windows.txtfile?.data);
  if (!data) return null;

  const { name, image, subtitle, description } = data;
  return (
    <div className="txt-body flex items-start md:items-center justify-center p-5 md:p-6">
      <div
        className={`flex flex-col md:flex-row items-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMaximized
            ? "gap-8 md:gap-16 max-w-5xl w-full md:px-8"
            : "gap-5 md:gap-6 w-full"
        }`}
      >
        {image ? (
          <div
            className={`flex-shrink-0 transition-all duration-300 ${
              isMaximized ? "w-44 md:w-72" : "w-36 md:w-1/3"
            }`}
          >
            <img
              src={image}
              alt={name ?? ""}
              className="w-full h-auto rounded-lg object-cover shadow-xl"
            />
          </div>
        ) : null}

        <div className="flex-1 space-y-4 w-full">
          {subtitle ? (
            <h3
              className={`font-bold leading-tight transition-all duration-300 ${
                isMaximized ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
              }`}
            >
              {subtitle}
            </h3>
          ) : null}

          {Array.isArray(description) && description.length > 0 ? (
            <div
              className={`space-y-3 leading-relaxed transition-all duration-300 ${
                isMaximized ? "text-base md:text-lg" : "text-sm"
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
  );
};

const Text = ({ isMaximized }) => {
  const name = useWindowStore((s) => s.windows.txtfile?.data?.name);

  return (
    <>
      <div id="window-header">
        <WindowControl target="txtfile" />
        <h2>{name ?? ""}</h2>
      </div>

      <TextBody isMaximized={isMaximized} />
    </>
  );
};

const TextWindow = WindowWrapper(Text, "txtfile");
export default TextWindow;
