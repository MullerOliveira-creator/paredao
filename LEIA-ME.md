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
