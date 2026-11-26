import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, FileText, Mail } from "lucide-react";
import useWindowStore from "#store/window";
import { prefetchWindow } from "#windows/loaders.js";

const EMAIL_ADDRESS = "vikas.yadav.connect@gmail.com";
const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL_ADDRESS}`;

const RecruiterCard = ({ compact = false }) => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(EMAIL_ADDRESS);
        setCopied(true);
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
        return;
      }
    } catch {
      // Fall back to mail compose if clipboard permission is blocked
    }
    window.open(GMAIL_COMPOSE_URL, "_blank", "noopener,noreferrer");
  };

  if (compact) {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="images/vikas.webp"
              alt="Vikas Yadav"
              className="size-7 rounded-full object-cover object-top ring-1 ring-white/50 dark:ring-white/20 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[12px] font-semibold leading-tight text-[var(--lg-text-primary)] truncate">
                Software Developer
              </p>
              <p className="text-[10.5px] leading-tight text-[var(--lg-text-muted)] truncate">
                Open to SDE &amp; Internships
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="lg-pill px-2.5 py-1.5 text-[11px] font-medium cursor-pointer"
              aria-label={`Copy email ${EMAIL_ADDRESS}`}
            >
              {copied ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Email</span>
                </>
              )}
            </button>

            <a
              href={`${import.meta.env.BASE_URL}files/resume.pdf`}
              download="Vikas_Yadav_Resume.pdf"
              className="lg-pill px-2.5 py-1.5 text-[11px] font-medium cursor-pointer"
              aria-label="Download Resume PDF"
            >
              <Download className="size-3" />
              <span>CV</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header: Portrait + Role + Status Pill */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="images/vikas.webp"
            alt="Vikas Yadav"
            className="size-9 rounded-full object-cover object-top ring-1 ring-white/60 dark:ring-white/20 shrink-0 shadow-sm"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-tight text-[var(--lg-text-primary)] truncate">
              Vikas Yadav
            </p>
            <p className="text-[11px] font-medium leading-snug text-[var(--lg-text-secondary)] truncate">
              Software Developer
            </p>
          </div>
        </div>

        <span className="lg-widget-status shrink-0">
          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.75)]" />
          Open
        </span>
      </div>

      {/* Concise Targeting Line */}
      <p className="text-[11px] text-[var(--lg-text-muted)] mb-2.5 truncate">
        Open to SDE &amp; Internships · Mumbai
      </p>

      {/* Instant Recruiter Actions */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleCopyEmail}
          title={`Copy ${EMAIL_ADDRESS}`}
          className="lg-pill flex-1 min-w-0 py-1.5 px-2.5 text-[11px] font-medium cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3 shrink-0 text-emerald-500" />
              <span className="truncate">Copied!</span>
            </>
          ) : (
            <>
              <Mail className="size-3 shrink-0" />
              <span className="truncate">Copy Email</span>
            </>
          )}
        </button>

        <button
          type="button"
          onMouseEnter={() => prefetchWindow("resume")}
          onFocus={() => prefetchWindow("resume")}
          onClick={() => openWindow("resume")}
          className="lg-pill py-1.5 px-2.5 text-[11px] font-medium cursor-pointer shrink-0"
        >
          <FileText className="size-3 shrink-0" />
          <span>Resume</span>
        </button>

        <a
          href={`${import.meta.env.BASE_URL}files/resume.pdf`}
          download="Vikas_Yadav_Resume.pdf"
          title="Download Resume PDF"
          aria-label="Download Resume PDF"
          className="lg-icon-btn shrink-0"
        >
          <Download className="size-3.5" />
        </a>
      </div>
    </div>
  );
};

export default RecruiterCard;
