import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../assets/fonts/fonts.css";
import "../css/style.css";
import "./react.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
