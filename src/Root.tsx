import { Composition } from "remotion";
import "./estilo/fontes";
import { LucasSaiyajin } from "./videos/LucasSaiyajin";
import { Folha } from "./videos/Folha/Folha";
import { TesteAnimacao, DURACAO as DUR_ANIM } from "./videos/TesteAnimacao/TesteAnimacao";
import { TesteEstilo, FIM } from "./videos/TesteEstilo/TesteEstilo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
