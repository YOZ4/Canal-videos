import { AbsoluteFill, Sequence } from "remotion";
import { Acabamento, Flash, Legendas, type Legenda } from "../../estilo/Overlays";
import { Cena1Acordando } from "./Cena1Acordando";
import { Cena2Musculos } from "./Cena2Musculos";
import { Cena3Poder } from "./Cena3Poder";
import { Cena4Fome } from "./Cena4Fome";

// Cortes (em frames, 30 fps)
export const C1 = 0;
export const C2 = 120;
export const C3 = 225;
export const C4 = 345;
export const FIM = 450;
export const PODER = 300; // momento da transformação (global)

const LEGENDAS: Legenda[] = [
  { text: "E se o Lucas", from: 4, to: 38 },
  { text: "acordasse", from: 38, to: 68 },
  { text: "com poder *Saiyajin?*", from: 68, to: 120 },
  { text: "os *músculos* dele", from: 120, to: 158 },
  { text: "ficariam", from: 158, to: 182 },
  { text: "*10x* mais densos.", from: 182, to: 225 },
  { text: "ele tenta", from: 225, to: 252 },
  { text: "liberar o *poder...*", from: 252, to: PODER },
  { text: "e *consegue!*", from: PODER, to: C4 },
  { text: "só que isso", from: C4, to: 372 },
  { text: "gasta *muita* energia.", from: 372, to: 410 },
  { text: "e ele cai de *fome.*", from: 410, to: FIM },
];

export const TesteEstilo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Acabamento>
        <Sequence from={C1} durationInFrames={C2 - C1} premountFor={0}>
          <Cena1Acordando />
        </Sequence>
        <Sequence from={C2} durationInFrames={C3 - C2}>
          <Cena2Musculos />
        </Sequence>
        <Sequence from={C3} durationInFrames={C4 - C3}>
          <Cena3Poder poderEm={PODER - C3} />
        </Sequence>
        <Sequence from={C4} durationInFrames={FIM - C4}>
          <Cena4Fome />
        </Sequence>
        <Flash at={PODER} dur={12} />
        <Legendas items={LEGENDAS} />
      </Acabamento>
    </AbsoluteFill>
  );
};
