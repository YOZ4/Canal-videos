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

/** letra de mão (quadro branco / desenho à mão) — Patrick Hand, licença OFL */
export const FONTE_MAO = "Patrick Hand";

loadFont({
  family: FONTE_MAO,
  url: staticFile("fonts/PatrickHand-Regular.woff2"),
  weight: "400",
  format: "woff2",
});
