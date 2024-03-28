import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function Popup() {
  const [startWith, setStartWith] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  return (
    <div className="App" style={{ height: 300, width: 300 }}>
      <header className="App-header">
        <div className="container">
          <label>
            Replace URLs that start with:
            <input
              onChange={(e) => setStartWith(e.target.value)}
              value={startWith}
              placeholder="..."
            />
          </label>
          <label>
            With this URL:
            <input
              onChange={(e) => setReplaceWith(e.target.value)}
              value={startWith}
              placeholder="..."
            />
          </label>
        </div>
      </header>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Popup />
);
