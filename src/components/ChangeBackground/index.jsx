// ChangeBackground/index.jsx — Premium Liquid-Glass wallpaper picker
//
// Visual design goals:
//  • True liquid-glass panel: heavy backdrop blur, very low opacity tint,
//    inset top highlight, layered shadows — wallpaper colors bleed through.
//  • All corners fully rounded (overflow-hidden on the sheet).
//  • Custom thin scrollbar — no ugly browser default.
//  • Premium glass Apply button and Upload button.
//  • No external dependencies added.

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ImageIcon, Upload } from "lucide-react";
import useWallpaperStore, { WALLPAPERS } from "#store/wallpaper";

// ─── Animation variants ──────────────────────────────────────────────────────

const sheetVariants = {
  hidden: { y: "110%", opacity: 0, scale: 0.98 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", damping: 30, stiffness: 320, mass: 0.9 },
  },
  exit: {
    y: "110%",
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

// ─── File validation ─────────────────────────────────────────────────────────

const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── Inline CSS string — scoped to this component only ───────────────────────
// Targets the custom scrollbar inside the grid and applies glass-dark overrides.

const SCOPED_STYLES = `
  /* Custom slim scrollbar — only inside the wallpaper grid */
  .cb-grid::-webkit-scrollbar {
    width: 40px;
  }
  .cb-grid::-webkit-scrollbar-track {
    background: transparent;
  }
  .cb-grid::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.25);
    border-radius: 99px;
  }
  .cb-grid::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.40);
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const ChangeBackground = () => {
  const {
    isPickerOpen,
    closePicker,
    activeWallpaperId,
    customWallpaperUrl: appliedCustomUrl,
    setWallpaper,
    setCustomWallpaper,
  } = useWallpaperStore();

  // Local selection — not applied until user clicks Apply
  const [previewId, setPreviewId] = useState(() => activeWallpaperId ?? "default-light");
  const [previewCustom, setPreviewCustom] = useState(null);
  const [uploadError, setUploadError] = useState("");

  // Ref tracks the staged object URL so we can revoke it properly
  const stagedUrlRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Sync when picker opens ────────────────────────────────────────────────
  useEffect(() => {
    if (isPickerOpen) {
      setPreviewId(activeWallpaperId ?? "default-light");
      setPreviewCustom(null);
      setUploadError("");
    }
  }, [isPickerOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup object URLs on unmount ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (stagedUrlRef.current) {
        URL.revokeObjectURL(stagedUrlRef.current);
        stagedUrlRef.current = null;
      }
    };
  }, []);

  // ── Escape key ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPickerOpen) return;
    const onKey = (e) => { if (e.key === "Escape") closePicker(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isPickerOpen, closePicker]);

  // ── Select preset ─────────────────────────────────────────────────────────
  const handleSelectPreset = useCallback((id) => {
    setPreviewId(id);
    setPreviewCustom(null);
    setUploadError("");
    if (stagedUrlRef.current) {
      URL.revokeObjectURL(stagedUrlRef.current);
      stagedUrlRef.current = null;
    }
  }, []);

  // ── File upload ───────────────────────────────────────────────────────────
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    if (!ACCEPTED_MIME.includes(file.type)) {
      setUploadError("Please choose a JPG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError("Image is too large. Please choose an image under 10 MB.");
      return;
    }

    setUploadError("");

    // Revoke previous staged URL
    if (stagedUrlRef.current) {
      URL.revokeObjectURL(stagedUrlRef.current);
      stagedUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      stagedUrlRef.current = objectUrl;
      setPreviewCustom({
        objectUrl,
        previewUrl: objectUrl,
        label: file.name.replace(/\.[^.]+$/, ""),
      });
      setPreviewId(null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setUploadError("Could not load that image. Please try another file.");
    };
    img.src = objectUrl;
  }, []);

  // ── Apply ─────────────────────────────────────────────────────────────────
  const handleApply = useCallback(() => {
    if (previewCustom) {
      stagedUrlRef.current = null; // ownership transferred to store
      setCustomWallpaper(previewCustom.objectUrl);
    } else if (previewId) {
      setWallpaper(previewId);
    }
    closePicker();
  }, [previewCustom, previewId, setCustomWallpaper, setWallpaper, closePicker]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isPickerOpen && (
        <>
          {/* Scoped CSS */}
          <style>{SCOPED_STYLES}</style>

          {/* Scrim */}
          <motion.div
            key="cb-overlay"
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99990,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
            }}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closePicker}
          />

          {/* Centering wrapper — uses flexbox so Framer Motion transforms
              don't conflict with CSS translateX(-50%) centering. */}
          <div style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 99991,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}>

          {/* Sheet — liquid glass panel */}
          <motion.div
            key="cb-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Change Background"
            style={{
              width: "100%",
              maxWidth: "670px",
              pointerEvents: "auto",

              // ── Liquid glass ──────────────────────────────────────────
              // Very low opacity tint so wallpaper colors bleed through the blur.
              // The inset top line acts as the "glass edge" catching the light.
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(48px) saturate(200%) brightness(1.15)",
              WebkitBackdropFilter: "blur(48px) saturate(200%) brightness(1.15)",

              // Outer border — subtle white edge
              border: "1px solid rgba(255, 255, 255, 0.22)",
              borderBottom: "none",

              // Layered shadows: top inset highlight + ambient shadow
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.45)",   // top highlight
                "inset 1px 0 0 rgba(255,255,255,0.12)",   // left edge
                "inset -1px 0 0 rgba(255,255,255,0.12)",  // right edge
                "0 -24px 80px rgba(0,0,0,0.50)",          // ambient lift
                "0 -4px 20px rgba(0,0,0,0.30)",           // close shadow
              ].join(", "),

              // Fully rounded top corners — overflow-hidden clips inner content
              borderRadius: "28px 28px 0 0",
              overflow: "hidden",
            }}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Inner padding */}
            <div style={{ padding: "24px 24px 20px" }}>

              {/* ── Header ──────────────────────────────────────────────── */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ImageIcon
                    style={{ width: "15px", height: "15px", color: "rgba(255,255,255,0.7)" }}
                  />
                  <h2 style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.90)",
                    letterSpacing: "0.02em",
                    margin: 0,
                  }}>
                    Change Background
                  </h2>
                </div>

                {/* Close button */}
                <button
                  type="button"
                  aria-label="Close wallpaper picker"
                  onClick={closePicker}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.12)",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                    color: "rgba(255,255,255,0.75)",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.22)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  }}
                >
                  <X style={{ width: "12px", height: "12px", strokeWidth: 2.5 }} />
                </button>
              </div>

              {/* ── Wallpaper grid ───────────────────────────────────────── */}
              <div
                className="cb-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "10px",
                  maxHeight: "220px",
                  overflowY: "auto",
                  padding: "4px",
                  marginBottom: "16px",
                }}
              >
                {WALLPAPERS.map((wp) => {
                  const isSelected = previewId === wp.id && !previewCustom;
                  return (
                    <WallpaperThumb
                      key={wp.id}
                      src={wp.preview}
                      label={wp.label}
                      isSelected={isSelected}
                      onClick={() => handleSelectPreset(wp.id)}
                    />
                  );
                })}

                {/* Uploaded image thumbnail */}
                {previewCustom && (
                  <WallpaperThumb
                    src={previewCustom.previewUrl}
                    label={previewCustom.label}
                    isSelected={true}
                    onClick={() => {}}
                  />
                )}
              </div>

              {/* ── Upload row ───────────────────────────────────────────── */}
              <div style={{ marginBottom: "16px" }}>
                <button
                  type="button"
                  aria-label="Upload wallpaper from device"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    border: "1px dashed rgba(255,255,255,0.28)",
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.70)",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 0.15s ease, border-color 0.15s ease",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.13)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
                  }}
                >
                  <Upload style={{ width: "13px", height: "13px", strokeWidth: 2 }} />
                  Choose from device
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>
                    JPG · PNG · WebP · AVIF · max 10 MB
                  </span>
                </button>

                {/* Hidden native input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={handleFileChange}
                />

                {uploadError && (
                  <p style={{
                    marginTop: "8px",
                    fontSize: "11px",
                    color: "rgba(255,140,140,0.95)",
                    textAlign: "center",
                  }}>
                    {uploadError}
                  </p>
                )}
              </div>

              {/* ── Apply button ─────────────────────────────────────────── */}
              <div style={{ display: "flex", justifyContent: "center", paddingBottom: "4px" }}>
                <button
                  id="cb-apply-btn"
                  type="button"
                  onClick={handleApply}
                  aria-label="Apply selected wallpaper"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "11px 40px",
                    borderRadius: "99px",
                    minWidth: "210px",
                    fontSize: "13px",
                    fontWeight: 600,
                    letterSpacing: "0.015em",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(255,255,255,0.35)",
                    background: "rgba(255,255,255,0.16)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: [
                      "inset 0 1px 0 rgba(255,255,255,0.35)",
                      "inset 0 -1px 0 rgba(0,0,0,0.15)",
                      "0 4px 20px rgba(0,0,0,0.28)",
                    ].join(", "),
                    transition: "background 0.18s ease, box-shadow 0.18s ease, transform 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.26)";
                    e.currentTarget.style.boxShadow = [
                      "inset 0 1px 0 rgba(255,255,255,0.45)",
                      "inset 0 -1px 0 rgba(0,0,0,0.12)",
                      "0 8px 30px rgba(0,0,0,0.35)",
                    ].join(", ");
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                    e.currentTarget.style.boxShadow = [
                      "inset 0 1px 0 rgba(255,255,255,0.35)",
                      "inset 0 -1px 0 rgba(0,0,0,0.15)",
                      "0 4px 20px rgba(0,0,0,0.28)",
                    ].join(", ");
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <Check style={{ width: "15px", height: "15px", strokeWidth: 2.5 }} />
                  Apply Wallpaper
                </button>
              </div>

            </div>
          </motion.div>
          </div>{/* end centering wrapper */}
        </>
      )}
    </AnimatePresence>
  );
};

// ─── WallpaperThumb — isolated to keep the grid JSX clean ────────────────────

const WallpaperThumb = ({ src, label, isSelected, onClick }) => (
  <button
    type="button"
    aria-label={`Select ${label} wallpaper`}
    aria-pressed={isSelected}
    onClick={onClick}
    style={{
      position: "relative",
      borderRadius: "10px",
      overflow: "hidden",       /* clips the zooming img — no layout escape */
      aspectRatio: "16/9",
      border: "none",
      padding: 0,
      cursor: "pointer",
      flexShrink: 0,
      outline: "none",
      boxShadow: isSelected
        ? "0 0 0 2px rgba(255,255,255,0.95), 0 0 0 4px rgba(80,160,255,0.85), 0 4px 16px rgba(0,0,0,0.4)"
        : "0 0 0 1px rgba(255,255,255,0.10), 0 2px 8px rgba(0,0,0,0.25)",
      transition: "box-shadow 0.18s ease",  /* no transform here — button never moves */
    }}
    onMouseEnter={(e) => {
      // Scale the img INSIDE the button, not the button itself.
      // overflow:hidden clips it so the grid cell never grows.
      const img = e.currentTarget.querySelector("img");
      if (img) img.style.transform = "scale(1.07)";
    }}
    onMouseLeave={(e) => {
      const img = e.currentTarget.querySelector("img");
      if (img) img.style.transform = "scale(1)";
    }}
  >
    <img
      src={src}
      alt={label}
      loading="lazy"
      draggable={false}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        transition: "transform 0.25s ease",   /* smooth zoom on the img only */
        willChange: "transform",
      }}
    />

    {/* Selected badge */}
    {isSelected && (
      <span style={{
        position: "absolute",
        top: "5px",
        right: "5px",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "rgba(59,130,246,1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
      }}>
        <Check style={{ width: "10px", height: "10px", color: "#fff", strokeWidth: 3 }} />
      </span>
    )}

    {/* Hover label */}
    <span style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: "4px 6px",
      fontSize: "9px",
      fontWeight: 500,
      color: "#fff",
      textAlign: "center",
      background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
      opacity: 0,
      transition: "opacity 0.2s ease",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
      className="cb-thumb-label"
    >
      {label}
    </span>
  </button>
);

export default ChangeBackground;
