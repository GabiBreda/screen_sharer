# Tela ao Vivo

MVP de compartilhamento temporário de tela, sem cadastro. A mídia percorre WebRTC; Socket.IO é usado apenas para presença, autorização e sinalização.

## Executar

Requer Node.js 18+ e npm 9+.

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. Use `.env.example` como referência de configuração.

```bash
npm run lint
npm test
npm run build
```

## Limitações do MVP

- Sessões e proteção contra tentativas ficam em memória e são perdidas ao reiniciar.
- Cada espectador recebe uma conexão WebRTC; capacidade depende da banda do apresentador.
- TURN é necessário para algumas redes corporativas/NATs restritivos.
- Produção requer HTTPS/WSS e autorização explícita do navegador.
