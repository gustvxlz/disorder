# DISORDER — Game Design Rescue

30/09/2026. Primeira missão redesenhada; nenhuma segunda missão implementada. Esta entrega não declara a slice aprovada nem comprova a diversão por uma avaliação humana. Arte Blender, resolução, movimento, colisões e pipeline estático foram preservados.

## 1. Missão antiga

Aviso → ramal 417 → autorização → impressão → gaveta/cartão → porta → conferência de três caixas → terminal. A maior parte do progresso era confirmar microetapas obrigatórias.

## 2. Remoções

Saíram os gates de autorização, impressão e contagem/rubrica das caixas. Foram removidos seus métodos/ações ativos, não apenas escondidos os botões. Telefone, impressora, gaveta e uma etiqueta de caixa continuam como interações opcionais. Campos antigos permanecem no save apenas para compatibilidade.

## 3. Nova missão

Antônio pede o inventário mensal de setembro do Arquivo B para Marta. Uma pasta pode ser carregada na prancheta. Marta aceita B-02, agradece e libera o intervalo; não exige registro no terminal. A pasta incorreta pode ser trocada na prateleira. A entrega ocorre uma única vez.

## 4. Orientação sem checklist

TAB mostra só o objetivo, não cada obstáculo. A porta identifica o acesso B sem criar nova missão. Marta, Antônio, circular e intranet apontam o quadro de chaves. Placas localizam Administração/Arquivo; a prateleira informa mês/ano. O cartão tem uma pequena identificação B visível no quadro e desaparece ao ser retirado.

## 5. Puzzle

Acesso compartilhado + interpretação do arquivo: agosto/mensal, setembro/mensal e setembro/manutenção. O jogador compara mês e tipo, não adivinha senha nem confirma três caixas. Marta explica a diferença se receber a pasta errada. Os testes cobrem os dois documentos incorretos, troca, acesso e entrega sem telefone/impressão.

## 6. Posições dos NPCs

Marta fica sentada na cadeira da sua mesa com CRT e inventário. Lúcia fica sentada na estação do Protocolo. Antônio trabalha nas cópias da impressora. Renato organiza pastas numa mesa da Administração e visita o bebedouro. Não foram adicionados figurantes, zelador ou segurança sem cenário/atividade.

## 7. Rotinas

Marta alterna digitação e leitura. Lúcia alterna digitação e leitura do desenho; sua tela acompanha essa troca. Antônio espera cópias, carrega documentos até a lateral da estação e volta à impressora. Renato organiza documentos, percorre o corredor, bebe e retorna. Rotas autoradas pequenas; decisão a 10 Hz, animação a 24 Hz, pausa na conversa, colisão e distância do jogador respeitadas. Fase/tempo/posição persistem. Não há simulação de vida ou sistema de navegação novo.

## 8. Easter eggs

Gato de Plantão: desenho pixelado original, três faixas discretas e animação CSS sem música importada. Varredura do Depósito: passatempo original 6×4 com números de vizinhança. NAO_ABRIR.txt, lista de compras, recado de café e concurso de mascotes. Créditos documentados; nenhum GIF/sprite/áudio Nyan Cat ou jogo de terceiros foi usado.

## 9. Computadores

Três CRTs: Protocolo, Lúcia e Marta. Desktop fictício SISCOR 2006 em HTML/CSS com intranet, correio, funcionários, ramais, inventário, documentos, pessoal e utilitários. Sem backend, conexão externa ou acesso ao computador real. Telas 3D usam três mapas 128×96 compartilhados, não ficam pretas. O livro de ocorrências anterior permanece opcional na intranet após contato, sem implementar outra tarefa.

## 10. Objetos

Quadro de chaves/cartão, três pastas, computadores, café, fotografia descrita em texto, bebedouro com efeito original e etiqueta de caixa. Avisos, telefone, impressora, gaveta e relógios seguem consultáveis. Nada disso vira pontuação ou recompensa de água/café. A fotografia 3D é o porta-retrato existente, não uma nova imagem ilustrada de cachorro.

## 11. Setores planejados

Núcleo: Protocolo/corredor/Administração/Arquivo B. Oeste: RH/Contabilidade/Arquivo Morto. Serviços: Refeitório/Cozinha/Almoxarifado/Manutenção. Entrada: Segurança/Estacionamento/Garagem. Leste/técnico: Ala Leste/Servidores/Subsolo/áreas técnicas. `BuildingPlan` prevê sete tarefas grandes, com revisitas e acesso por história; somente a primeira é jogável. Nenhuma sala procedural/infinita.

## 12. Áreas bloqueadas

Arquivo B usa o cartão e conserva estado da porta. Placas das portas laterais e da Ala Leste indicam restrição; essas áreas são reservas, não conteúdo construído. Os três interruptores existentes continuam controlando grupos de luminárias/emissivos por setor; sem nova luz global ou sombras em tempo real.

## 13. Duração real observada

Cronômetro de parede do playtest automatizado local: aproximadamente **30,5 minutos até a entrega** e **36,9 minutos até a primeira quebra**. Inclui latência dos comandos, leitura, orientação da câmera e pausas para correções. Não representa o ritmo de uma pessoa com teclas pressionadas continuamente. Não há medição humana limpa de 10–15 minutos de conteúdo. O mínimo de 600 segundos de simulação protege normalidade, mas um jogador rápido pode concluir a tarefa antes disso; o intervalo é opcional, não uma nova lista de obrigações. Esse risco de tempo vazio permanece para avaliação humana.

## 14. Playtest sem DEV

Executado em `http://127.0.0.1:4173/`, sem query DEV. NEW SHIFT, abertura, caminhada até Marta/porta, negativa de acesso, volta ao Protocolo, retirada do cartão, revisita/abertura, prateleira mensal, B-02, entrega pessoal, prancheta concluída, reload/CONTINUE, volta pelo corredor, desktop opcional e primeiro contato. Somente controles normais, mouse e caminhada; nenhum teleporte diagnóstico, skip, posição DEV, alteração de save ou injeção de estado. O reenquadramento automático da cutscene é comportamento do jogo, não um atalho do teste. Save retomou posição/entrega; após reload não havia RESUME, mas CONTINUE estava disponível. Console local sem warnings/erros registrados.

Capturas reais em `source-assets/gameplay-review/`: objetivo, pasta, entrega, conclusão, Renato no bebedouro, CRT aceso, desktop e contato. A caminhada inicial validou a missão; correções finais pequenas foram verificadas nos testes e na publicação, sem alegar um segundo percurso completo na versão publicada. Smoke test público sem DEV: NEW SHIFT, abertura, objetivo único, desktop Protocolo, caminhada ao quadro, retirada do cartão/desaparecimento visual e Settings; canvas confirmado em 640×480 e console público sem warnings/erros registrados.

## 15. Confusões encontradas

Onde buscar o cartão após a negativa da porta; qual documento de setembro; como falar com uma funcionária sentada; aproximação do quadro atrás de mobiliário; funcionário bloqueando uma passagem; orientar a câmera com comandos automatizados muito curtos. Esta última dificuldade aumenta o cronômetro do teste e não comprova um defeito para mouse/tecla humanos.

## 16. Correções

Cartão/quadro colocados na parede acessível junto à saída; pistas coerentes em NPC/aviso/intranet. Etiquetas de mês e tipo, diálogo de pasta incorreta. Conversas respeitam pose sentada e miram altura adequada. Antônio não ocupa a aproximação da impressora; seu ponto junto à mesa foi deslocado de x=0,6 para x=0,1, fora do colisor. Teste percorre todos os pontos das quatro rotinas com geometria real. Telas foram trazidas à frente do vidro do GLB. Pastas não relacionadas não desaparecem após entrega. Sem setas/checklist/HUD adicional.

## 17. Primeira quebra

Implementada após entrega + dez minutos mínimos de normalidade + retorno próximo à impressora. Impressão inesperada, breve interferência apenas no circuito do Protocolo, telefone e voz sem origem confirmada. Nenhuma anomalia de relógio/olhos antes disso. Depois: oito segundos e saída da sala liberam seleção existente; olhos exigem 30 segundos pós-contato, Marta vista normal e distância. Não foram acrescentadas anomalias/salas/finais.

## 18. Entidade

Três falas curtas: “Você consegue me ouvir?”, “Ótimo. Alguma coisa mudou.”, “Não confie em tudo que reconhece.” Sem identidade, universo de origem ou explicação causal. Telefonema funciona como interferência, sem nova etapa obrigatória de atendimento. Mantida voz sintética não posicional.

## 19. Explicação explícita removida

Removida do diálogo e da folha atuais. Busca em narrativa/UI runtime não encontrou afirmação de colisão de universos/dimensões. Relatórios históricos não foram reescritos como se nunca tivessem existido; não são carregados pelo jogo.

## 20. FPS

Três amostras locais visíveis em Settings normal: **161, 164 e 165 FPS**. Amostra da publicação final: **163 FPS**. Não é benchmark de computador modesto nem promessa de mínimo. Nenhuma leitura de métrica exigiu DEV.

## 21. Draw calls

Nas mesmas amostras locais: **15, 28 e 30 chamadas**, com 176.694, 181.428 e 179.528 triângulos renderizados, respectivamente. Amostra pública final: **14 chamadas / 176.208 triângulos**. Não são máximos de toda a run. Inventário de teste da cena final: 124 meshes / 229.758 triângulos — contado separadamente, não chamado de draw calls. Nenhum GLB foi regenerado; nenhum shadow map/luz real foi acrescentado.

## 22. Build

`npm run build` aprovado, 43 módulos, sem warning relevante. JS do jogo 85,28 kB / 29,23 kB gzip; CSS 5,86 kB / 2,15 kB gzip. Chunks Three preservados. Caminhos relativos Vite e runtime inteiramente estático.

## 23. Testes

**27/27 aprovados**. Incluem acesso/mês/tipo/entrega, tempo de normalidade e gates, seeds, save v3/migração, rotina restaurada, quatro ciclos completos com colliders reais, telas compartilhadas, pastas persistentes, desktop opcional sem mutar objetivo, pausa/áudio, raycast/obstrução, portas, movimento, GLBs, corpo e buffers de áudio. O teste automático não julga diversão, qualidade auditiva ou naturalidade de animação.

## 24. Commits

Implementação: `8f9311a` — missão, puzzle diegético, rotinas, computadores e regressões. Documentação/evidências desta etapa ficam em commit separado. Referências do autor (`models/`, `musicas_jogo/`) e capturas antigas fora desta revisão não foram incluídas.

## 25. GitHub Actions

[Publicação da implementação](https://github.com/gustvxlz/disorder/actions/runs/36783046914): **build e deploy concluídos com sucesso**. Conferência HTTP: **30/30 arquivos publicados correspondem ao build local**, incluindo JS, CSS, GLBs, texturas e áudio (JSON comparado semanticamente por normalização de fim de linha no runner Linux). Nenhum arquivo retornou 404. Bundle do jogo: `index-DiLxsWJh.js`. Workflow existente preservado.

## 26. URL

[DISORDER no GitHub Pages](https://gustvxlz.github.io/disorder/). Para testar a missão nova, usar **NEW SHIFT**, sem `?dev=true`; CONTINUE preserva progresso anterior.

## 27. Limitações / ponto de parada

Ainda é uma slice de três setores, não prédio enorme/campanha inteira. Meta de 10–15 minutos de conteúdo divertido não homologada; cronômetro automatizado não a prova. Rotinas/poses são simples, podem aguardar passagem e não fazem gestos complexos de mouse/retirada de folhas. Sem zelador/segurança nem segunda missão. Sem benchmark em hardware modesto ou avaliação humana de áudio/diversão. A sequência foi encurtada e ganhou uma escolha diegética, mas a busca/entrega continua simples; sua qualidade precisa ser julgada pelo autor. **Parar aqui; não iniciar a próxima missão automaticamente.**
