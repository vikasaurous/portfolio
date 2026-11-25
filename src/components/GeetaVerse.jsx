const GeetaVerse = () => (
  <p
    aria-hidden="true"
    style={{
      position: "fixed",
      bottom: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9998,
      fontFamily: '"Newsreader", Georgia, "Times New Roman", serif',
      fontSize: "clamp(0.78rem, 0.95vw, 0.84rem)",
      fontWeight: 400,
      lineHeight: 1.35,
      textAlign: "center",
      letterSpacing: "0.005em",
      color: "rgba(255, 255, 255, 0.82)",
      textShadow: "0 1px 6px rgba(0, 0, 0, 0.48)",
      margin: 0,
      padding: "0 0 3px",
      whiteSpace: "nowrap",
      pointerEvents: "none",
      userSelect: "none",
    }}
  >
    <span style={{ fontStyle: "italic" }}>
      &#8220;You have the right to perform your duties, but you are not entitled to the fruits of your actions.&#8221;
    </span>{" "}
    <span
      style={{
        fontFamily: '"Host Grotesk", -apple-system, BlinkMacSystemFont, sans-serif',
        fontStyle: "normal",
        fontSize: "0.86em",
        fontWeight: 500,
        letterSpacing: "0.02em",
        color: "rgba(255, 255, 255, 0.62)",
      }}
    >
      — Bhagavad Gita, Chapter 2, Verse 47
    </span>
  </p>
);

export default GeetaVerse;