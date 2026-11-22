import { Composition } from "remotion";
import "./estilo/fontes";
import { LucasSaiyajin } from "./videos/LucasSaiyajin";
import { Folha } from "./videos/Folha/Folha";
import { FolhaPoses } from "./videos/Folha/FolhaPoses";
import { Saiyajin2D, DURACAO as DUR_SAI } from "./videos/Saiyajin2D/Saiyajin2D";
import { SaiyajinV2, DURACAO as DUR_SAI2 } from "./videos/Saiyajin2D/SaiyajinV2";
import { TesteAnimacao, DURACAO as DUR_ANIM } from "./videos/TesteAnimacao/TesteAnimacao";
import { TesteEstilo, FIM } from "./videos/TesteEstilo/TesteEstilo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="SaiyajinV2" component={SaiyajinV2} durationInFrames={DUR_SAI2} fps={30} width={1080} height={1920} />
      <Composition id="FolhaPoses" component={FolhaPoses} durationInFrames={1} fps={30} width={2600} height={1400} />
      <Composition id="Saiyajin2D" component={Saiyajin2D} durationInFrames={DUR_SAI} fps={30} width={1080} height={1920} />
      <Composition id="TesteAnimacao" component={TesteAnimacao} durationInFrames={DUR_ANIM} fps={30} width={1080} height={1920} />
      <Composition id="Folha" component={Folha} durationInFrames={1} fps={30} width={1600} height={1500} />
      <Composition
        id="TesteEstilo"
        component={TesteEstilo}
        durationInFrames={FIM}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LucasSaiyajin"
        component={LucasSaiyajin}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
