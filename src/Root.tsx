import { Composition } from "remotion";
import "./estilo/fontes";
import { LucasSaiyajin } from "./videos/LucasSaiyajin";
import { TesteEstilo, FIM } from "./videos/TesteEstilo/TesteEstilo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
