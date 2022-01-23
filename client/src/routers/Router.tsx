import { BrowserRouter as Router, Switch } from "react-router-dom";
import {baseRoutes_} from "../constants/Route";

import CommonRoute from "./CommonRoute";

import Home from "../components/home"

function AppRouter() {
  return (
    <Router>
      <Switch>
        <CommonRoute component={Home} path={baseRoutes_.root} />
      </Switch>
    </Router>
  );
}

export default AppRouter;
