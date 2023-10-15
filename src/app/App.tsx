import "./App.css";
import { useState, useEffect } from "react";
import { Theme } from "./util/theme";
import Home from "./components/home";
import { baseSettings, getSettings, putSettings } from "../shared/settings";
import { Settings } from "../shared/interface";
import { SettingsContext } from "./context/settings";

function App() {
  const [settings, setSettings] = useState(baseSettings);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const persistSettings = (settings: Settings) => {
    putSettings(settings).then(setSettings);
  };

  return (
    <>
      <SettingsContext.Provider value={{ settings, persistSettings }}>
          <div className="app">
            <div className="main-section">
              <Home />
            </div>
          </div>
      </SettingsContext.Provider>
    </>
  );
}

export default App;
