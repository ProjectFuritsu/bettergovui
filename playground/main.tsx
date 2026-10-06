import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Frame from "./Frame";
import "./playground.css";

// The device preview loads this same page with ?frame, which renders only the component
const isFrame = new URLSearchParams(location.search).has("frame");

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {isFrame ? <Frame /> : <App />}
    </StrictMode>,
);
