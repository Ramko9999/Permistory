import { useContext } from "react";
import * as Icon from "react-feather";
import ThemeContext, { isDark, isLight, ThemeType } from "../../context/ThemeContext";
import "./Navbar.css";

const switchTheme = (setTheme: any) => {
  if (document.documentElement.getAttribute("data-theme") === "dark") {
    document.documentElement.setAttribute("data-theme", "light");
    setTheme(ThemeType.LIGHT);
  } else {
    setTheme(ThemeType.DARK);
    document.documentElement.setAttribute("data-theme", "dark");
  }
};
function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <nav className="navbar">
      <div className="logo">
        <Icon.Shield />
        <h1 className="title-header">{"permistory"}</h1>
      </div>

      <div className="links">
        {isDark(theme) && (
          <Icon.Sun onClick={() => switchTheme(setTheme)} className="icon" />
        )}
        {isLight(theme) && (
          <Icon.Moon onClick={() => switchTheme(setTheme)} className="icon" />
        )}

        <a href="https://github.com/TanushN/permistory">
          <Icon.GitHub />
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
