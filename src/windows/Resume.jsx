import { WindowControl } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import { Download } from "lucide-react";
import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

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

      <div className="resume-body">
        <Document file={`${import.meta.env.BASE_URL}files/resume.pdf`}>
          <Page pageNumber={1} renderTextLayer renderAnnotationLayer />
        </Document>
      </div>
    </>
  );
};

const ResumeWindow = WindowWrapper(Resume, "resume");

export default ResumeWindow;
