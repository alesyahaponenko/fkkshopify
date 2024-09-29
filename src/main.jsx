import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"

import { ThemeProvider } from "@material-tailwind/react"

ReactDOM.createRoot(document.getElementById("canvas")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
