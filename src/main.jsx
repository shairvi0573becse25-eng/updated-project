import React, { useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import templates from "./pageTemplates.json";
import "./react.css";

function getPageKey() {
  const filename = window.location.pathname.split("/").filter(Boolean).pop() || "index.html";
  const key = filename.replace(/\.html$/i, "");
  return templates[key] ? key : "index";
}

function App() {
  const pageKey = useMemo(getPageKey, []);
  const page = templates[pageKey];

  useEffect(() => {
    document.title = page.title;
    document.body.className = page.bodyClass;

    // Load the original page scripts in their original order so existing interactions
    // (calendar, countdown, filtering, saving, registration and forms) keep working.
    let cancelled = false;
    const loadedScripts = [];

    const loadScripts = async () => {
      for (const item of page.scripts) {
        if (cancelled) return;
        const script = document.createElement("script");
        if (item.src) {
          script.src = `./${item.src}`;
          script.async = false;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Could not load ${item.src}`));
            document.body.appendChild(script);
          });
        } else {
          script.textContent = item.inline || "";
          document.body.appendChild(script);
        }
        loadedScripts.push(script);
      }
      if (!cancelled) {
        // Legacy page logic registers DOMContentLoaded handlers; the React app mounts
        // after the browser's original DOMContentLoaded event, so replay it for these
        // preserved scripts after the page markup has been inserted.
        document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
      }
    };

    loadScripts().catch((error) => console.error("Campus Events script loading error:", error));

    return () => {
      cancelled = true;
      loadedScripts.forEach((script) => script.remove());
    };
  }, [page, pageKey]);

  return (
    <div
      id="legacy-page-root"
      dangerouslySetInnerHTML={{ __html: page.html }}
    />
  );
}

createRoot(document.getElementById("root")).render(<App />);
