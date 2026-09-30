import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("raiz")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);