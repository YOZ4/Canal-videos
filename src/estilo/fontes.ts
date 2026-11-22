import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const FONTE_LEGENDA = "Roboto Condensed";
export const FONTE_ROTULO = "Fredoka";

loadFont({
  family: FONTE_LEGENDA,
  url: staticFile("fonts/RobotoCondensed-ExtraBold.woff2"),
  weight: "800",
  format: "woff2",
});

loadFont({
  family: FONTE_ROTULO,
  url: staticFile("fonts/Fredoka-Bold.woff2"),
  weight: "700",
  format: "woff2",
});
