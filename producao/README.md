# Esteira de produção (4 agentes)

Cada episódio ganha uma pasta `producao/<episodio>/` (nome curto, minúsculo, sem acento). Os agentes conversam
**por arquivos** nessa pasta — cada um lê o do anterior e escreve o seu. Assim nada se perde entre sessões.

| # | Agente (`.claude/agents/`) | Lê | Escreve |
|---|---|---|---|
| 1 | `roteiro-visual` — Roteiro e Pacote Visual | ideia / prints / áudio | `roteiros/<ep>.txt`, `01-roteiro.md`, `01-kit-visual.md` |
| 2 | `direcao-visual` — Direção Visual, Expressão e Câmera | 01 + imagens de referência | `02-direcao.md` |
| 3 | `animador-remotion` — Animador Remotion | 01 + 02 (+ 04 nas rodadas de ajuste) | código em `src/videos/<Pasta>/`, `03-animacao.md`, vídeo de teste |
| 4 | `revisor-qualidade` — Revisor de Qualidade e Fluidez | vídeo + 01/02/03 | `04-revisao-<n>.md` (revisão 1 e 2 + ajustes cirúrgicos) |

## Fluxo
1. Usuário manda ideia/roteiro/áudio/referências → **roteiro-visual**.
2. Usuário busca/gera as imagens do kit (ou já mandou) → **direcao-visual**.
3. **animador-remotion** implementa e renderiza um rascunho (meia resolução).
4. **revisor-qualidade** revisa → **animador-remotion** aplica → repetir 3–4 até o veredito "aprovado" (no máximo 2–3 rodadas).
5. Render final em resolução total, `finalizar.sh`, entrega ao usuário (vídeo `-alta.mp4` no chat, versão leve < 100 MB no git),
   atualizar `MEMORIA.md`, commit + push.

## Pontos de parada com o usuário
- Depois do passo 1: confirmar roteiro e kit de referências (ele decide a história).
- Antes do render final: mostrar quadros/rascunho se houver dúvida de estilo.
- Na entrega: resumo das duas revisões (o que foi achado / ajustado), tempo gasto, "o que ainda dá para melhorar".

## Cuidados
- Renderização usa toda a máquina: **um render por vez**; nunca dois agentes renderizando juntos.
- Cada agente começa sem a conversa: tudo o que importa tem de estar nos arquivos desta pasta ou na `MEMORIA.md`.
- Pedidos pequenos (ajustar um plano, trocar um som) não precisam da esteira inteira.

## Skills de apoio da equipe
- `analise-movimento-remotion` — movimento dos personagens (anti-robótico).
- `motion-design` — gráficos, textos, infográficos, câmera (cascata, molas, tempos).
- `desenho-a-mao` — trechos de quadro branco (gráfico/seta/texto se desenhando).
- `cena-3d` — objetos 3D no visual do canal (esfera de energia, planeta, cristal). Personagens seguem 2D.
