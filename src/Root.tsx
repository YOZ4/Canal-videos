import { Composition } from "remotion";
import "./estilo/fontes";
import { LucasSaiyajin } from "./videos/LucasSaiyajin";
import { Folha } from "./videos/Folha/Folha";
import { Broly, DURACAO as DUR_BROLY } from "./videos/Broly/Broly";
import { FolhaFuria } from "./videos/Folha/FolhaFuria";
import { FolhaAngulos } from "./videos/Folha/FolhaAngulos";
import { TesteJJK, DURACAO as DUR_JJK } from "./videos/EstiloJJK/TesteJJK";
import { TesteMovimento2, DURACAO as DUR_MOV2 } from "./videos/Movimento/TesteMovimento2";
import { TesteMovimento, DURACAO as DUR_MOV } from "./videos/Movimento/TesteMovimento";
import { TesteAcabamento, DURACAO as DUR_ACAB } from "./videos/TesteAcabamento/TesteAcabamento";
import { TesteCorrida2, DURACAO as DUR_CORR2 } from "./videos/Corrida/TesteCorrida2";
import { TesteCorrida, DURACAO as DUR_CORR } from "./videos/Corrida/TesteCorrida";
import { FolhaCorrida } from "./videos/Folha/FolhaCorrida";
import { ComparaEstilos } from "./videos/Folha/ComparaEstilos";
import { Cacadores, DURACAO as DUR_CAC } from "./videos/Cacadores/Cacadores";
import { LutaTeste, DURACAO as DUR_LUTA } from "./videos/Luta/LutaTeste";
import { FolhaPoses } from "./videos/Folha/FolhaPoses";
import { FolhaVistas } from "./videos/Folha/FolhaVistas";
import { Saiyajin2D, DURACAO as DUR_SAI } from "./videos/Saiyajin2D/Saiyajin2D";
import { SaiyajinV2, DURACAO as DUR_SAI2 } from "./videos/Saiyajin2D/SaiyajinV2";
import { SaiyajinV3, DURACAO as DUR_SAI3 } from "./videos/Saiyajin2D/SaiyajinV3";
import { TesteAnimacao, DURACAO as DUR_ANIM } from "./videos/TesteAnimacao/TesteAnimacao";
import { TesteFerramentas, DURACAO as DUR_FERR } from "./videos/Ferramentas/TesteFerramentas";
import { FichaLucas, FichaDiego, FICHA_W, FICHA_H } from "./videos/Folha/FichaPersonagem";
import { FichaEgito } from "./videos/Egito/FichaEgito";
import { Egito, DURACAO as DUR_EGITO } from "./videos/Egito/Egito";
import { TesteCameraAcrobacia, TesteCameraLuta, DURACAO_CAM } from "./videos/TesteCamera/TesteCamera";
import { FolhaGolpes, FOLHA_G_W, FOLHA_G_H } from "./videos/Folha/FolhaGolpes";
import { DemoGolpes, DURACAO_DEMO } from "./videos/TesteCamera/DemoGolpes";
import { DemoGolpes2, DURACAO_DEMO2 } from "./videos/Luta2/DemoGolpes2";
import { FichaAsch } from "./videos/Asch/FichaAsch";
import { Asch, DURACAO as DUR_ASCH } from "./videos/Asch/Asch";
import { TesteEstilo, FIM } from "./videos/TesteEstilo/TesteEstilo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="DemoGolpes" component={DemoGolpes} durationInFrames={DURACAO_DEMO} fps={30} width={1080} height={1920} />
      <Composition id="Asch" component={Asch} durationInFrames={DUR_ASCH} fps={60} width={1080} height={1920} />
      <Composition id="FichaAsch" component={FichaAsch} durationInFrames={1} fps={60} width={2400} height={1400} />
      <Composition id="DemoGolpes2" component={DemoGolpes2} durationInFrames={DURACAO_DEMO2} fps={30} width={1080} height={1920} />
      <Composition id="FolhaGolpes" component={FolhaGolpes} durationInFrames={1} fps={30} width={FOLHA_G_W} height={FOLHA_G_H} />
      <Composition id="TesteCameraAcrobacia" component={TesteCameraAcrobacia} durationInFrames={DURACAO_CAM} fps={30} width={1080} height={1920} />
      <Composition id="TesteCameraLuta" component={TesteCameraLuta} durationInFrames={DURACAO_CAM} fps={30} width={1080} height={1920} />
      <Composition id="Egito" component={Egito} durationInFrames={DUR_EGITO} fps={60} width={1080} height={1920} />
      <Composition id="FichaEgito" component={FichaEgito} durationInFrames={1} fps={60} width={2400} height={1500} />
      <Composition id="FichaLucas" component={FichaLucas} durationInFrames={1} fps={30} width={FICHA_W} height={FICHA_H} />
      <Composition id="FichaDiego" component={FichaDiego} durationInFrames={1} fps={30} width={FICHA_W} height={FICHA_H} />
      <Composition id="TesteFerramentas" component={TesteFerramentas} durationInFrames={DUR_FERR} fps={30} width={1080} height={1920} />
      <Composition id="Broly" component={Broly} durationInFrames={DUR_BROLY} fps={24} width={1080} height={1920} />
      <Composition id="FolhaFuria" component={FolhaFuria} durationInFrames={4} fps={24} width={1080} height={1920} />
      <Composition id="FolhaAngulos" component={FolhaAngulos} durationInFrames={7} fps={24} width={1080} height={1920} />
      <Composition id="TesteJJK" component={TesteJJK} durationInFrames={DUR_JJK} fps={24} width={1080} height={1920} />
      <Composition id="TesteMovimento2" component={TesteMovimento2} durationInFrames={DUR_MOV2} fps={30} width={1080} height={1920} />
      <Composition id="TesteMovimento" component={TesteMovimento} durationInFrames={DUR_MOV} fps={30} width={1080} height={1920} />
      <Composition id="TesteAcabamento" component={TesteAcabamento} durationInFrames={DUR_ACAB} fps={30} width={1080} height={1920} />
      <Composition id="TesteCorrida2" component={TesteCorrida2} durationInFrames={DUR_CORR2} fps={30} width={1080} height={1920} />
      <Composition id="TesteCorrida" component={TesteCorrida} durationInFrames={DUR_CORR} fps={30} width={1080} height={1920} />
      <Composition id="FolhaCorrida" component={FolhaCorrida} durationInFrames={1} fps={30} width={3200} height={3000} />
      <Composition id="ComparaEstilos" component={ComparaEstilos} durationInFrames={1} fps={30} width={2160} height={1920} />
      <Composition id="Cacadores" component={Cacadores} durationInFrames={DUR_CAC} fps={30} width={1080} height={1920} />
      <Composition id="FolhaVistas" component={FolhaVistas} durationInFrames={1} fps={30} width={2400} height={2560} />
      <Composition id="LutaTeste" component={LutaTeste} durationInFrames={DUR_LUTA} fps={30} width={1080} height={1920} />
      <Composition id="SaiyajinV3" component={SaiyajinV3} durationInFrames={DUR_SAI3} fps={30} width={1080} height={1920} />
      <Composition id="SaiyajinV2" component={SaiyajinV2} durationInFrames={DUR_SAI2} fps={30} width={1080} height={1920} />
      <Composition id="FolhaPoses" component={FolhaPoses} durationInFrames={1} fps={30} width={3000} height={1400} />
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
