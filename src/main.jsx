import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./pcb-group-website";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
