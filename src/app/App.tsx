import "./App.css";
import { useState } from "react";
import { ThemeContext, Theme, ThemeType } from "./context/theme";
import Home from "./components/home";

function App() {
  const [theme, setTheme] = useState(ThemeType.LIGHT);
  return (
    <>
      <ThemeContext.Provider value={{ theme, setTheme } as Theme}>
        <div className="app">
          <div className="main-section">
            <Home />
          </div>
        </div>
      </ThemeContext.Provider>
    </>
  );
}

export default App;
