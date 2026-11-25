import { WindowControl } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import { Download } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export const ResumeBody = ({ className = "" }) => {
  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(undefined);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const innerWidth = Math.max(0, el.clientWidth - 24);
      setPageWidth(innerWidth > 0 && innerWidth < 612 ? innerWidth : undefined);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`resume-body ${className}`.trim()}>
      <Document file={`${import.meta.env.BASE_URL}files/resume.pdf`}>
        <Page
          pageNumber={1}
          width={pageWidth}
          renderTextLayer
          renderAnnotationLayer
        />
      </Document>
    </div>
  );
};

const Resume = () => {
  return (
    <>
      <div id="window-header">
        <WindowControl target="resume" />

        <h2>Vikas_Yadav_Resume.pdf</h2>
        <a
          href={`${import.meta.env.BASE_URL}files/resume.pdf`}
          download="Vikas_Yadav_Resume.pdf"
          className="lg-icon-btn ml-auto"
          title="Download Resume"
          aria-label="Download Resume"
        >
          <Download size={14} />
        </a>
      </div>

      <ResumeBody />
    </>
  );
};

const ResumeWindow = WindowWrapper(Resume, "resume");

export default ResumeWindow;
