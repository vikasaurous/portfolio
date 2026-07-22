import WindowWrapper from '#hoc/WindowWrapper';
import SafariBrowser from './SafariBrowser';

// WindowWrapper provides: GSAP open/close animation, draggable, z-index management
// 'safari' matches the key in WINDOW_CONFIG — no store changes needed
const SafariWindow = WindowWrapper(SafariBrowser, 'safari');

export default SafariWindow;
