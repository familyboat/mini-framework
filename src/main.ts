import { Router } from "lib";
import { Landing } from "./pages/landing";
import { Loading } from "./pages/loading";
import "./style.css";
import { Shopping } from "./pages/shopping";

Loading.create({
  name: "loading",
});

Landing.create({
  name: "landing",
});

Shopping.create({
  name: "shopping",
});

Router.navigate("loading");
