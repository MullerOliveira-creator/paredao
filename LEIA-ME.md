# Paredão Player · versão com Spotify

Esta pasta é o Paredão de verdade, ligado à sua conta do Spotify. Sem login, ele abre em **modo demonstração**, com o catálogo de exemplo.

## 1. Configurar o app no Spotify for Developers (uma vez)

1. Entre em https://developer.spotify.com/dashboard e abra o seu app.
2. Em **Settings › Redirect URIs**, adicione exatamente:
   - `http://127.0.0.1:8888/` para usar no notebook;
   - o seu endereço HTTPS, se publicar online (ex.: `https://SEU-USUARIO.github.io/paredao/`).
3. Em **APIs used**, marque **Web API** e **Web Playback SDK**.
4. Em **User Management**, cadastre o e-mail da sua conta Spotify e o de quem mais for usar. Apps criados depois de fevereiro de 2026 aceitam no máximo 5 usuários, e o dono do app precisa ter Premium.
5. Copie o **Client ID**. O Client Secret **não** é usado.

## 2. Rodar no notebook

- **Windows:** dê dois cliques em `iniciar-windows.bat`.
- **Mac/Linux:** rode `./iniciar-mac-linux.sh`.

As duas formas precisam do Python instalado: https://www.python.org/downloads/ (no Windows, marque "Add to PATH").

O navegador abre em **http://127.0.0.1:8888/**. Use esse endereço, e não `localhost`, porque o Spotify não aceita `localhost`.

Depois:

1. Clique na engrenagem (Configurações) no canto superior direito da tela inicial. Ali também ficam as cores e fundos.
2. Cole o Client ID. A chave do Last.fm é opcional e explicada abaixo.
3. Clique em **Salvar e conectar** e autorize no site do Spotify.

## 3. Publicar online (para TV e celular)

O endereço `127.0.0.1` só existe dentro do notebook. Para abrir o Paredão na TV ou no celular, publique a pasta num endereço HTTPS:

1. Crie um repositório no GitHub (ex.: `paredao`) e envie todos os arquivos desta pasta.
2. Em **Settings › Pages**, escolha a branch `main` e salve.
3. Cadastre o endereço gerado (ex.: `https://SEU-USUARIO.github.io/paredao/`) nos Redirect URIs do app.

## 4. Rádio melhor com Last.fm (opcional)

O Spotify não libera mais "recomendações" para apps novos. Com uma chave gratuita do Last.fm, a Rádio usa "faixas parecidas" do Last.fm e encontra essas músicas no Spotify.

Para criar a chave:

1. Acesse https://www.last.fm/api/account/create.
2. Preencha só o nome do app.
3. Copie a **API key** para a configuração do Paredão.

Sem a chave, a Rádio usa o mesmo artista e o mesmo período de lançamento.

## O que cada botão faz com o Spotify

| Botão | Como funciona |
|---|---|
| Play, pausa, anterior, próxima, avançar no anel, volume | Comandos do player do Spotify, no aparelho que estiver tocando |
| Dispositivos | Lista os seus aparelhos com Spotify ("Este navegador", TV, celular…) e transfere a música para o escolhido |
| Busca | Busca do Spotify. Ela devolve no máximo 10 itens por vez, então o Paredão busca duas páginas |
| Explorar e dado | Suas mais ouvidas do último mês, as tocadas recentemente e as curtidas |
| Coração | Salva na sua biblioteca do Spotify ou remove dela |
| Adicionar à fila | Fila real do Spotify |
| Mais do artista | Álbuns e singles do artista, já que o "top tracks" foi removido da API |
| Rádio | Last.fm + Spotify, ou só Spotify, como explicado acima |
| Letra sincronizada | LRCLIB, um serviço gratuito de letras. Nem toda música tem letra |
| Podcasts | Último episódio dos programas que você segue no Spotify |
| Cor do anel | Calculada a partir da capa |
| Teclas de mídia e tela de bloqueio | Media Session do navegador |

## Limites conhecidos

- **Sem recomendações oficiais:** o Spotify cortou recomendações, artistas relacionados e características de áudio. O Explorar e a Rádio são montados com as alternativas da tabela acima.
- **Uso pessoal:** no Modo Desenvolvimento o app aceita no máximo 5 usuários, cadastrados manualmente.
- **Tocar no navegador do celular ou da TV** pode falhar por causa de DRM. Nesse caso, deixe o app Spotify tocando e use o Paredão como controle (veja a tabela por aparelho).
- **Acesso aos dados:** o Client ID e o login ficam guardados só no seu navegador (localStorage). A senha nunca passa pelo Paredão.

## Pop-up flutuante (janelinha por cima de tudo)

- **Chrome ou Edge no Windows/Mac (versão 116+):** o botão "Pop-up holograma" abre uma janelinha de verdade, que fica por cima de outras abas e de outros programas. Se fechar a janelinha, o player volta para a página.
- **iPhone (Safari), TV Samsung, Echo Show:** esses navegadores não têm esse recurso. O pop-up continua funcionando dentro da própria página. Para tocar nesses aparelhos, use o Paredão como controle remoto: escolha o aparelho em "Dispositivos".

## Volume

- Cada aparelho tem uma barrinha de volume própria no menu "Dispositivos".
- Na primeira vez que um aparelho toca pelo Paredão, ele começa em 10%.
- Alguns aparelhos (ex.: Echo Dot) não aceitam volume pelo Spotify; aí use o volume do próprio aparelho.

## Rodada 5 (novidades)

- Começa grande: o Paredão se ajusta ao tamanho da tela (TV, notebook, Echo, celular) e pede tela cheia no primeiro toque.
- Engrenagem (cores e Spotify) e casinha (voltar ao início) em vidro, nas cores do tema, em todas as telas.
- Fila do próprio Paredão: adicionar, tirar (×), subir/descer (↑ ↓) e tocar direto. Botão **Fila** no canto de baixo da tela de espera.
- Botão **Playlists**: as suas playlists e busca de playlists no Spotify; toca a playlist inteira.
- Letra grande saindo do cubo; gire o cubo deslizando o dedo ou com a rodinha do mouse.
- Consultas ao Spotify bem mais leves (evita o bloqueio "muitos pedidos").

Para atualizar no GitHub: suba `index.html`, `spotify.js`, `r5.css`, `r5.js` e a pasta `fonts` inteira. **Não** substitua o `config.js` (ele já tem o seu Client ID).

## Rodada 6 (novidades)

- Fonte Chakra Petch em tudo (vem junto com o site).
- Cores em duas etapas: fundo **Claro** ou **Escuro** + **cor neon** à parte (engrenagem).
- Botões: casinha (início) e elipse "Hora do Show" (tela de espera) no canto esquerdo; dado de vidro para embaralhar.
- Dispositivos em cartões de vidro, com o % de cada aparelho e o volume do selecionado.
- Faces novas do cubo: **Sua história com esta música** (cima), **Sobre o artista** (baixo) e **O que a letra quer dizer** (esquerda, precisa da chave do Genius).
- Modo palco escolhível nas configurações: Cápsula, Paredão, Toca-discos, Fita cassete, Display de som automotivo, Ingresso, Ilha dinâmica, Painel de aeroporto e Holograma.

Para atualizar no GitHub: suba `index.html`, `spotify.js`, `r5.css`, `r5.js`, `r6.js` e a pasta `fonts` inteira (pode apagar os arquivos `saira-…` antigos da pasta `fonts` no GitHub). **Não** substitua o `config.js`.

### Pop-up no Android (rodada 6b)
- No Android (e onde só existe picture-in-picture de vídeo), o botão de pop-up abre uma janelinha flutuante do sistema com capa, música, artista e progresso.
- Tocar/pausar/voltar/avançar aparecem como botões nativos da janelinha.
- Ícone da tela de espera: nota + onda sonora no estilo da casinha. Face "Sua história" no layout novo (Last.fm + top do Spotify).
- Pop-up Android segue o estilo do modo palco: Paredão, Toca-discos, Fita cassete, Display automotivo (VFD) e Painel de aeroporto; os outros usam o cartão.
- Barra de progresso (anel) usa a cor principal da capa também na demonstração; capa sem cor usa o neon do tema.

### Rodada 7
- Pop-up do computador mostra o estilo do modo palco escolhido, com botões embaixo (a barra escura de cima é do Chrome).
- Cubo gira acompanhando o dedo/mouse e encaixa ao soltar; rolagem do mouse rola a face quando ela tem conteúdo.
- Mais leve: logo Hora do Show sem redesenho a cada quadro, fumaça sem filtro animado; modo leve automático na TV/Echo Show (sem desfoque de vidro).
- Tela de espera: Hora do Show menor e cubo maior. Dica de favoritos em cima do coração. Volume não some no mudo.
- Dispositivos em faixa compacta, até 6 lado a lado; letra grande some enquanto a faixa está aberta.
- Pop-up "Sem barra" (padrão): no computador também usa a janelinha de vídeo, sem a barra do Chrome; "Com botões" volta a usar a janela com a barra. Escolha em Configurações → Pop-up.
- Rodada 8 (r8.css): esferas e controles do player no vidro do play; botões com texto em pílula de vidro; cartões com contorno neon no escolhido; Salvar em neon cheio.
- Configurações: painel não passa mais da borda de baixo (o Salvar ficava escondido).
- Shuffle com o dado D2 (dois dados) e Salvar com o disquete S2, os dois no vidro do play.

### Rodada 9
- Spotify: consultas caem de ~760/hora para ~120–200/hora por tela aberta (o progresso anda sozinho; consulta no fim da música, depois de um comando e a cada 25 s; parado 45 s; sem mexer há 10 min, 60–120 s). Aparelhos a cada 5 min.
- Fila = fila real do Spotify (igual no celular). "Adicionar à fila" vai direto para o Spotify. O app não troca mais a música sozinho.
- Diagnóstico em Configurações: consultas por minuto/hora/dia e por tipo, com "Copiar relatório".
- Roda de cores livre para o neon. Mini player novo: Mesa de DJ (também na janelinha de vídeo).
- Echo Show / celular deitado: o player e a tela de espera cabem na altura real (sem cortar os controles).
- Pop-up em vídeo aberto: a página mostra só o aviso, sem o holograma por trás.
- Aviso de uso no celular (app ntfy): Configurações → "Aviso de uso no celular". Avisa em 70% (uso alto), 90% (muito alto, liga o modo econômico) e quando a cota estoura. Teto padrão 2.000/dia por aparelho; depois que a cota estourar uma vez, usa 90% daquele número.
- Modo palco: Jukebox (leva difícil), também na janelinha de vídeo.
- Mini player não estica mais ao ser arrastado.
- Modo palco #12 Bolha de sabão: página, pop-up do computador e janelinha de vídeo; botão de tocar/pausar dentro da bolha; reflexo acompanha o ponteiro.
- Rodada 10: cubo de vidro fosco brilhante, sempre inclinado (mostra 3 faces) e balançando de leve; faces em ordem fixa 1-6 (Letra, Capa, Próximas, Sua história, Sobre o artista, O que a letra quer dizer) com marcador; não volta sozinho para a letra; letra grande com relevo em camadas e entrada vindo de dentro da tela.

## Rodada 11 — novos mini players (modo palco)
- Holograma Hora do Show, Dado de controles, Órbita de controles (#88), Baralho de capas, Letras dançantes.
- Fundo transparente na página; todos os botões de dentro funcionam (tocar, anterior, próxima, favoritar, aleatório, próximas, abrir o player).
- Janelinha do sistema (iPhone/Android): desenho próprio para os 5; Dado e Órbita ficam quadrados, Baralho fica em pé.
- Botões ⟲10 / ⟳10 da janelinha: anterior / próxima, com a animação do estilo (carta voando, dado rolando, holograma piscando).
- Arquivos: r11.css, r11.js (+ ajustes em r6.js, pip.js, spotify.js).
- Configurações → "Modo palco · fundo transparente": Ligado (padrão, só o objeto flutua) / Desligado (painel de vidro atrás). Na janelinha do sistema, Ligado = fundo preto puro.

## Rodada 12
- Barra de tempo virou um anel em volta do play (arrastar no anel escolhe o ponto da música). O retângulo atrás do cubo sumiu.
- Cubo: mais alto (não invade os botões), para virado para a esquerda ou para a direita, congela enquanto você segura, opacidade do vidro ajustável.
- Marcador das faces só com o nome, na cor do tema. Próximas em cartões 3D lado a lado.
- Letra grande ocupa quase a tela toda (TV/computador).
- Volume: número ao lado da barra, centralizado; some no mudo. Número da fila na cor do tema (some quando zero).
- Configurações: bloco "Modo palco" com 1. Estilo, 2. Fundo, 3. Janelinha, 4. Vidro do cubo.
- Janelinha de vídeo: sem botões desenhados (os controles são os do sistema); a bolha treme/respira.
- Arquivos: r12.css, r12.js (+ ajustes em r6.js, r9.js, pip.js).
- 12b: cubo maior (sem invadir os botões), letra maior conforme o tamanho da frase, número do volume em cima da bolinha, play/anterior/próxima menores.

## Rodada 13 — Paredão para Windows
- r13.css / r13.js: quando a página abre dentro do programa de Windows, só o mini player aparece, sem fundo, com a barrinha (arrastar, −, +, configurações, fechar).
- O programa (Paredao-Player-portatil.exe) abre o site oficial; no navegador comum nada muda.
- 13b: arrastar a janela pela barrinha ou pelo próprio mini player; letra passando embaixo (botão de linhas na barrinha liga/desliga).

## Rodada 14 — motor de tempo
- r14.js: relógio único (tempo calculado a partir do último ponto conferido com o Spotify), correção do atraso da rede, conferência extra 3,5 s depois de cada troca de música e a cada 12 s enquanto a letra está na tela; programa de Windows não deixa mais o mini player sumir.

## Rodada 15 — cores simples
- r15.js/css: Configurações → Cores com duas bolas (Fundo e Neon, abrem o seletor de cor do aparelho), barra de brilho do neon e combinações prontas. r5.js aceita fundo livre (bgx) e brilho (nb); o claro/escuro sai da cor do fundo.
- 15b: todas as barras (brilho, vidro do cubo, volume dos aparelhos etc.) com a mesma cara da barra de volume.
- 15c: engrenagem abre e fecha as Configurações; × mais no canto.
- 15d: barra de tempo nas arestas do cubo; seletor de cor não fecha mais no iPhone; espera troca música só em face escondida; 1 gesto de rolagem = 1 face; controles do player na linha de baixo; cubo maior e mais calmo.
- 15e: giro do cubo mais lento (1,4 s) e arrasto menos sensível; letra longa quebra linha em vez de sair da tela.
- 15f: janelinha do Chrome mede de novo quando os estilos carregam (Órbita ficava com zoom gigante); sem contorno de seleção depois do clique; F11 não acende botão.
