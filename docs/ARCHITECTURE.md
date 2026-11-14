# Arquitetura

`apps/web` contém React, `getDisplayMedia` e WebRTC. `apps/server` contém API HTTP e Socket.IO. `packages/shared` concentra contratos e regras de código.

## Sessões

O servidor gera um `code` de 10 caracteres `[A-Z0-9]` com `crypto.randomBytes`, retentando colisões. Também gera um `presenterToken` de 256 bits entregue somente na criação. O token autentica o socket do apresentador; o código não concede privilégios.

O `SessionStore` em memória é a fronteira para um futuro Redis. Estados: `waiting`, `streaming`, `paused`, `ended`.

## Eventos

- `session:join`: entrada de apresentador ou espectador.
- `stream:start`, `stream:stop`, `session:end`: somente apresentador.
- `webrtc:offer`, `webrtc:answer`, `webrtc:ice-candidate`: sinalização dentro da sessão.
- `session:viewers`, `session:state`, `session:ended`, `stream:stopped`: atualizações do servidor.

## Produção

Use HTTPS/WSS, TURN, rate limiting distribuído, Redis para sessões e o adaptador Redis do Socket.IO. Não registrar tokens, SDP, candidatos ICE ou conteúdo de tela.
