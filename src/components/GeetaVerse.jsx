const GeetaVerse = () => (
  <p
    aria-hidden="true"
    style={{
      position: "fixed",
      bottom: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9998,
      fontFamily: "system-ui",
      fontSize: "clamp(0.7rem, 0.9vw, 0.72rem)",
      fontWeight: 400,
      lineHeight: 1.4,
      textAlign: "center",
      letterSpacing: "0.015em",
      fontStyle: "italic",
      color: "rgba(255, 255, 255, 0.7)",
      textShadow: "0 1px 3px rgba(0,0,0,0.45)",
      margin: 0,
      padding: "0 0 4px",
      whiteSpace: "nowrap",
      pointerEvents: "none",
      userSelect: "none",
    }}
  >
    &#8220;You have the right to perform your duties, but you are not entitled to the fruits of your actions.&#8221; — Bhagavad Gita, Chapter 2, Verse 47
  </p>
);

export default GeetaVerse;