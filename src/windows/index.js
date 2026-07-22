import Terminal from "./Terminal/Terminal.jsx";
import Finder from "./Finder.jsx";
import Text from "./Text.jsx";
import Image from "./Image.jsx";
import Contact from "./Contact.jsx";
import Trash from "./Trash.jsx";

// Resume is intentionally excluded — it is lazy-loaded in App.jsx
// to defer react-pdf + pdf.worker.min.mjs from the initial bundle.
export { Terminal, Finder, Text, Image, Contact, Trash };
