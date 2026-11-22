# Acabamento "feito à mão" (src/estilo2d/Pintura.tsx)

Técnicas estudadas em dois projetos abertos (Claude Animation Base, licença MIT; Lemo-Opuscar, código MIT) e
reescritas do zero para SVG/Remotion. Nada foi instalado. Não use o mascote laranja de nenhum desses projetos
(pertence à Anthropic) nem copie os textos dos guias do Lemo-Opuscar para o repositório (licença não comercial).

| Componente | O que faz | Quando usar |
|---|---|---|
| `<Ferve chave ancora? forca=3>` | contorno treme de leve 12x/s, cada elemento com seu tremor | sempre: cenário (`forca` 2) e personagens (2–2,5). Personagem: `ancora={[pose.x, pose.y]}` |
| `<NoDois>` / `noDois(f)` | cada desenho fica 2 quadros | ação, luta, corrida, desenho anos 50. Não use em câmera lenta/panorâmica suave |
| `trocaRosto(f, keys)` (anim.ts) | troca de expressão com antecipação + reação com mola | toda mudança de humor; `tamanho` 0,5 suave · 1 normal · 1,5–2 susto |
| `<SombraCel chave luz=-135>` | sombra e brilho de borda dura a partir da silhueta | luta, aura, momentos épicos (visual anime 80) |
| `<Desencaixe chave px=4>` | cor desencaixada do contorno, tremendo | episódio especial "anos 50", vinhetas cômicas |
| `<Aquarela chave>` | bordas tremidas, manchas de pigmento, borda escura | lembranças, sonhos, momentos calmos |
| `<FilmeMudo sepia estrago fps=16>` | P&B/sépia, cintilação, balanço, riscos, poeira, borda queimada, 16 fps | flashback antigo (o avô jovem, "antigamente") |
| `<Luz x y r cor forca>` | luz aditiva (soma luz, não mistura tinta) | lâmpada, estrela, aura, punho brilhando; fica forte no escuro |

Granulado de filme: só no final, com `scripts/finalizar.sh` (o `Textura` estático de papel continua valendo).

## Custo de render
- `Ferve`/`Aquarela`/`SombraCel` são filtros SVG: cada um custa alguns ms por quadro. Use um `Ferve` para o cenário
  inteiro e um por personagem, não um por pecinha.
- `FilmeMudo` e `NoDois` usam `<Freeze>`: tudo que está dentro anda no ritmo deles (inclusive piscar e falar).
  Áudio (`Som`, narração) fica FORA deles.
- Ao renderizar stills em paralelo, rode no máximo 2–3 ao mesmo tempo (os filtros pesam).

## Problemas conhecidos
- `Desencaixe` trata tudo que é bem escuro como "linha" (cabelo preto do Lucas, pupilas). É o charme do estilo; se
  incomodar, use `px` menor.
- Personagem que anda muito rápido sem `ancora` no `Ferve` treme a cada quadro (atravessa o ruído).
