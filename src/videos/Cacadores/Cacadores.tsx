import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile } from "remotion";
import { Conquista, Contagem, LegendaPalavra, Selo } from "../../estilo2d/UI";
import * as C1 from "./Cenas1";
import * as C2 from "./Cenas2";
import { Som } from "./comum";
import { DURACAO, LEGENDAS, T } from "./tempo";

export { DURACAO };

/** cenas na ordem: [componente, trecho da narração onde a cena COMEÇA] */
const CENAS: [React.FC<{ t0: number }>, number][] = [
  [C1.S01, 0],
  [C1.S02, T("Agora imagina")],
  [C1.S03, T("Você nasceu")],
  [C1.S04, T("Seu avô sempre")],
  [C1.S05, T("Na fila")],
  [C1.S06, T("Braços cruzados")],
  [C1.S07, T("Tenta não chorar")],
  [C1.S08, T("Tenta não se perder")],
  [C1.S09, T("Primeira fase")],
  [C1.S10, T("Ninguém sabe")],
  [C1.S11, T("O Diego dispara")],
  [C1.S12, T("Mas o seu corpo")],
  [C1.S13, T("Você tem entre")],
  [C1.S14, T("Seus ancestrais")],
  [C1.S15, T("Quarenta quilômetros")],
  [C1.S16, T("E encontra o Diego")],
  [C1.S17, T("Eu tava pegando")],
  [C1.S18, T("Fôlego desbloqueado")],
  [C2.S19, T("Segunda fase")],
  [C2.S20, T("Um copo cheio")],
  [C2.S21, T("Você coloca as mãos")],
  [C2.S22, T("e a água sobe")],
  [C2.S23, T("Isso é tensão")],
  [C2.S24, T("Só que a água")],
  [C2.S25, T("Tipo Reforço")],
  [C2.S26, T("Do lado o copo")],
  [C2.S27, T("Vocês se encaram")],
  [C2.S29, T("Fase final")],
  [C2.S30, T("Ele ataca")],
  [C2.S31, T("Seu coração dispara")],
  [C2.S32, T("sua aura explode")],
  [C2.S33, T("Primeiro round")],
  [C2.S34, T("Ele só fala")],
  [C2.S35, T("Aí você lembra")],
  [C2.S36, T("Você respira devagar")],
  [C2.S37, T("Na vida real")],
  [C2.S38, T("No mundo Hunter faz")],
  [C2.S39, T("Segundo round")],
  [C2.S41, T("um soco só")],
  [C2.S42, T("O Diego voa")],
  [C2.S43, T("Licença Hunter desbloqueada")],
  [C2.S44, T("Você estende")],
  [C2.S45, T("Dois segundos depois")],
  [C2.S46, T("Claro Topete")],
  [C2.S47, T("Força sem controle")],
  [C2.S48, T("Comenta qual")],
];

export const Cacadores: React.FC = () => {
  const lutaDe = T("Fase final");
  const lutaAte = T("Você estende");
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {CENAS.map(([Cena, de], i) => {
        const ate = i + 1 < CENAS.length ? CENAS[i + 1][1] : DURACAO;
        return (
          <Sequence key={i} from={de} durationInFrames={Math.max(1, ate - de)}>
            <Cena t0={de} />
          </Sequence>
        );
      })}

      {/* sobreposições */}
      <Contagem numeros={[{ n: "3", de: T("Três") }, { n: "2", de: T("dois um") }, { n: "1", de: T("um um soco") }]} ate={T("um soco só") - 1} />
      <Conquista texto="FÔLEGO" icone="≋" de={T("Fôlego desbloqueado")} ate={T("Segunda fase") + 6} cor="#2f6fd6" />
      <Conquista texto="NEN" icone="✦" de={T("Nen desbloqueado")} ate={T("Fase final") + 26} cor="#7d5bd6" />
      <Conquista texto="LICENÇA HUNTER" icone="★" de={T("Licença Hunter desbloqueada")} ate={T("Você estende") - 2} cor="#e8343f" />
      <Selo texto="ROUND 2" de={T("Segundo round")} ate={T("Três") - 1} cor="#e8343f" y={300} />
      <LegendaPalavra palavras={LEGENDAS} />

      {/* narração */}
      <Html5Audio src={staticFile("narracao/cacadores.mp3")} volume={1} />
      {/* trilhas (baixas, por baixo da voz) */}
      <Html5Audio
        src={staticFile("musica/trilha-leve-longa.wav")}
        volume={(f) =>
          interpolate(f, [0, 20, lutaDe - 15, lutaDe, lutaAte, lutaAte + 20, DURACAO - 30, DURACAO], [0, 0.1, 0.1, 0, 0, 0.1, 0.1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      <Html5Audio
        src={staticFile("musica/trilha-luta-longa.wav")}
        volume={(f) =>
          interpolate(f, [lutaDe - 10, lutaDe + 5, T("Aí você lembra") - 5, T("Aí você lembra") + 10, T("Segundo round") - 10, T("Segundo round"), lutaAte - 10, lutaAte + 10], [0, 0.12, 0.12, 0.03, 0.03, 0.14, 0.14, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {/* efeitos sonoros globais */}
      <Som src="pop" de={T("Fôlego desbloqueado")} volume={0.4} />
      <Som src="brilho" de={T("Fôlego desbloqueado") + 2} volume={0.35} />
      <Som src="pop" de={T("Nen desbloqueado")} volume={0.4} />
      <Som src="brilho" de={T("Nen desbloqueado") + 2} volume={0.35} />
      <Som src="pop" de={T("Três")} volume={0.45} />
      <Som src="pop" de={T("dois um")} volume={0.45} />
      <Som src="pop" de={T("um um soco")} volume={0.45} />
      <Som src="whoosh" de={T("Primeira fase") - 4} volume={0.35} />
      <Som src="whoosh" de={T("Segunda fase") - 4} volume={0.35} />
    </AbsoluteFill>
  );
};
