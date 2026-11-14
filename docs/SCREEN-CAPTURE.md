# Diagnóstico de captura

O navegador sempre mostra o seletor do sistema. O aplicativo não escolhe nem contorna fontes protegidas.

## Classificação

1. Se a prévia local estiver preta, a origem não está fornecendo frames utilizáveis ao navegador. Teste outra fonte, Chrome e Edge, e os modos janela, sem bordas, tela cheia e motores gráficos disponíveis no aplicativo.
2. Se a prévia estiver normal e o espectador preta, registre as estatísticas WebRTC (`framesSent`, `bytesSent`, `framesReceived`, `framesDecoded`) e o estado ICE.
3. Se ICE falhar, teste com TURN configurado. STUN não assegura conectividade em redes restritivas.

O aviso de prévia preta é heurístico: uma cena realmente escura pode gerar falso positivo. A análise usa apenas pixels na memória local e não registra nem transmite conteúdo.

## Matriz de homologação manual

| Cenário | Resultado esperado |
|---|---|
| Chrome e Edge, tela inteira | Prévia e espectador recebem frames |
| Janela permitida pelo SO | Prévia e espectador recebem frames |
| Cancelar seletor | Mensagem de cancelamento, sem stream ativo |
| Negar permissão | Mensagem clara, sem stream ativo |
| Encerrar pelo navegador | Tracks e peers são liberados; espectador é avisado |
| Fonte preta/protegida | Aviso local; nenhuma alegação de compatibilidade |
| Dois espectadores | Uma conexão WebRTC por espectador |
| Queda de rede | Estado de conexão é informado; Socket.IO tenta reconectar |

Testes com Tibia ou BattlEye precisam ser manuais em Windows. Registre navegador, versão, Windows, GPU, modo de exibição e motor gráfico; não tente desativar ou contornar proteções.
