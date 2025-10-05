import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Buffer } from "buffer";

// Attach Buffer polyfill for libraries expecting Node's Buffer in browser
;(window as any).Buffer = (window as any).Buffer || Buffer;

createRoot(document.getElementById("root")!).render(<App />);
