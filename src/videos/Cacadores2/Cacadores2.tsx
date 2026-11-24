import { AbsoluteFill, Html5Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Conquista, Contagem, LegendaPalavra, Selo } from "../../estilo2d/UI";
import { Cortina, Iris, ZoomRapido } from "../../estilo2d/Transicoes";
import { PoeiraFlutuante } from "../../estilo2d/Acabamento";
import { Textura } from "../../estilo2d/chibi/RuaTexturizada";
import { Som } from "../Cacadores/comum";
import { DURACAO, LEGENDAS, T } from "../Cacadores/tempo";
import { A1, A2, A3, A4, A5, A6, A7 } from "./atos1";
import { A8 } from "./atos2";
import { A10, A11, A12, A9, CONTATO2, QUEDA1 } from "./atos3";

export { DURACAO };

/**
 * REMAKE "Caçadores — parte 1" (mesma narração do original, `out/cacadores-parte1-v4.mp4`), refeito com:
 * camada de naturalidade (pés plantados, cabelo/camiseta com mola), rosto atuado, torção de tronco, luta.ts (fases,
 * hit-stop, alcance, queda), desenho à mão nos infográficos, copo do Nen em 3D toon, FilmeMudo nas lembranças.
 * Atos: A1 prova · A2 mundo Hunter · A3 avô · A4 fila/Diego · A5 corrida · A6 infográficos · A7 40 km · A8 Nen ·
 * A9 round 1 · A10 respiração · A11 round 2 · A12 final.
 */
const ATOS: [React.FC<{ t0: number }>, number][] = [
  [A1, 0],
  [A2, T("Você nasceu")],
  [A3, T("Seu avô sempre")],
  [A4, T("Na fila")],
  [A5, T("Primeira fase")],
  [A6, T("Mas o seu corpo")],
  [A7, T("Quarenta quilômetros")],
  [A8, T("Segunda fase")],
  [A9, T("Fase final")],
  [A10, T("Aí você lembra")],
  [A11, T("Segundo round")],
  [A12, T("Você estende")],
];

/** mostra só o ato do quadro atual, no relógio ABSOLUTO do vídeo (selos, placares e rótulos usam o quadro do vídeo) */
const AtoAtual: React.FC = () => {
  const f = useCurrentFrame();
  let Ato = ATOS[0][0];
  for (const [A, de] of ATOS) if (f >= de) Ato = A;
  return <Ato t0={0} />;
};

export const Cacadores2: React.FC = () => {
  const lutaDe = T("Fase final");
  const lutaAte = T("Você estende");
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AtoAtual />

      {/* sobreposições (as do original que funcionavam) */}
      <Contagem numeros={[{ n: "3", de: T("Três") }, { n: "2", de: T("dois um") }, { n: "1", de: T("um um soco") }]} ate={T("um soco só") - 1} />
      <Conquista texto="FÔLEGO" icone="≋" de={T("Fôlego desbloqueado")} ate={T("Segunda fase") + 6} cor="#2f6fd6" />
      <Conquista texto="NEN" icone="✦" de={T("Nen desbloqueado")} ate={T("Fase final") + 26} cor="#7d5bd6" />
      <Conquista texto="LICENÇA HUNTER" icone="★" de={T("Licença Hunter desbloqueada")} ate={T("Você estende") - 2} cor="#e8343f" />
      <Selo texto="ROUND 2" de={T("Segundo round")} ate={T("Três") - 1} cor="#e8343f" y={300} />
      <Iris de={T("Seu avô sempre") - 8} dur={16} x={540} y={760} />
      <Iris de={T("Aí você lembra") - 8} dur={16} x={540} y={900} />
      <Cortina de={T("Primeira fase") - 7} dur={14} cor="#ff9b2f" />
      <Cortina de={T("Segunda fase") - 7} dur={14} cor="#7d5bd6" cor2="#c9b6ff" />
      <Cortina de={T("Fase final") - 7} dur={14} cor="#e8343f" cor2="#ffb0b5" />
      <ZoomRapido de={T("Licença Hunter desbloqueada") - 5} dur={10} />
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width={1080} height={1920}>
          <PoeiraFlutuante />
          <Textura />
        </svg>
      </AbsoluteFill>
      <LegendaPalavra palavras={LEGENDAS} y={1560} tamanho={78} />

      <Html5Audio src={staticFile("narracao/cacadores.mp3")} volume={1} />
      <Html5Audio
        src={staticFile("musica/trilha-leve-longa.wav")}
        volume={(f) => interpolate(f, [0, 20, lutaDe - 15, lutaDe, lutaAte, lutaAte + 20, DURACAO - 30, DURACAO], [0, 0.1, 0.1, 0, 0, 0.1, 0.1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      <Html5Audio
        src={staticFile("musica/trilha-luta-longa.wav")}
        volume={(f) =>
          interpolate(f, [lutaDe - 10, lutaDe + 5, T("Aí você lembra") - 5, T("Aí você lembra") + 10, T("Segundo round") - 10, T("Segundo round"), CONTATO2 - 30, CONTATO2 - 4, CONTATO2 + 10, lutaAte - 10, lutaAte + 10], [0, 0.12, 0.12, 0.03, 0.03, 0.14, 0.14, 0, 0.16, 0.14, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      {/* efeitos */}
      <Som src="plim" de={T("esqueceu") + 6} volume={0.4} />
      <Som src="rumble" de={T("Agora imagina")} volume={0.55} />
      <Som src="whoosh" de={T("Você nasceu")} volume={0.35} />
      <Som src="brilho" de={T("Prova Hunter")} volume={0.35} />
      <Som src="whoosh" de={T("Primeira fase") - 4} volume={0.35} />
      <Som src="whoosh" de={T("O Diego dispara")} volume={0.45} />
      <Som src="pop" de={T("Fôlego desbloqueado")} volume={0.4} />
      <Som src="brilho" de={T("Fôlego desbloqueado") + 2} volume={0.35} />
      <Som src="whoosh" de={T("Segunda fase") - 4} volume={0.35} />
      <Som src="aura" de={T("Você coloca as mãos")} volume={0.3} />
      <Som src="pop" de={T("até transbordar")} volume={0.35} />
      <Som src="impacto" de={T("Tipo Reforço") + 4} volume={0.3} />
      <Som src="pop" de={T("Nen desbloqueado")} volume={0.4} />
      <Som src="brilho" de={T("Nen desbloqueado") + 2} volume={0.35} />
      <Som src="whoosh" de={T("Ele ataca")} volume={0.4} />
      <Som src="impacto" de={T("você trava")} volume={0.45} />
      <Som src="coracao" de={T("Seu coração dispara")} volume={0.6} />
      <Som src="aura" de={T("sua aura explode")} volume={0.5} />
      <Som src="impacto" de={QUEDA1} volume={0.45} />
      <Som src="pisada" de={QUEDA1 + 14} volume={0.45} />
      <Som src="carga" de={T("No mundo Hunter faz")} volume={0.4} />
      <Som src="pop" de={T("Três")} volume={0.45} />
      <Som src="pop" de={T("dois um")} volume={0.45} />
      <Som src="pop" de={T("um um soco")} volume={0.45} />
      <Som src="whoosh" de={CONTATO2 - 6} volume={0.5} />
      <Som src="explosao" de={CONTATO2} volume={0.6} />
      <Som src="impacto" de={CONTATO2} volume={0.6} />
      <Som src="brilho" de={T("Licença Hunter desbloqueada")} volume={0.4} />
    </AbsoluteFill>
  );
};
