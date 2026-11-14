# AGENTS.md — ScreenShare

## 1. Objetivo

Desenvolver uma aplicação web de compartilhamento
de tela em tempo real, utilizando sessões temporárias.

O sistema deve ser simples, seguro e intuitivo.

Não haverá:

- Cadastro de usuários.
- Login ou autenticação tradicional.
- Controle remoto do computador.
- Gravação das transmissões.
- Transferência de arquivos.
- Chat no MVP.

## 2. Tecnologias

Frontend:

- React
- TypeScript

Backend:

- Node.js
- TypeScript
- Socket.IO

Transmissão:

- WebRTC
- getDisplayMedia()
- STUN/TURN quando necessário

Infraestrutura:

- Docker Compose

Testes:

- Vitest
- Playwright

Não adicionar banco de dados inicialmente.

As sessões serão armazenadas em memória no MVP.

## 3. Tela inicial

Ao acessar o sistema, apresentar duas opções:

1. Criar sessão
2. Entrar em sessão

Não solicitar informações pessoais.

## 4. Criação de sessão

Quando o usuário clicar em "Criar sessão":

1. Solicitar a criação da sessão ao backend.
2. Gerar um código alfanumérico de 10 caracteres.
3. Utilizar letras maiúsculas A-Z e números 0-9.
4. Gerar o código com aleatoriedade criptográfica.
5. Garantir unicidade entre sessões ativas.
6. Exibir o código com botão para copiar.
7. Disponibilizar as configurações:
   - Compartilhar tela.
   - Compartilhar áudio (opcional).
8. Disponibilizar botão "Iniciar compartilhamento".

O compartilhamento deve iniciar somente após
autorização explícita do navegador.

O usuário poderá compartilhar:

- Tela inteira.
- Janela específica.
- Aba do navegador.

As opções disponíveis dependem do navegador.

O áudio deve ser transmitido somente quando solicitado
e quando a fonte e o navegador oferecerem suporte.

## 5. Entrada em sessão

Quando o usuário clicar em "Entrar em sessão":

1. Exibir um campo para informar o código.
2. Aceitar somente caracteres A-Z e 0-9.
3. Converter letras minúsculas para maiúsculas.
4. Exigir exatamente 10 caracteres.
5. Validar o código no backend.
6. Verificar se a sessão existe e está ativa.
7. Conectar o participante como espectador.

Exibir mensagens amigáveis para sessões inválidas,
encerradas ou indisponíveis.

Não exigir cadastro ou identificação.

## 6. Regras de sessão

- Cada sessão possui um código público único.
- Cada sessão possui um apresentador.
- Uma sessão pode possuir múltiplos espectadores.
- Somente o apresentador compartilha a tela.
- Espectadores possuem acesso somente à visualização.
- O apresentador pode interromper a transmissão.
- O apresentador pode encerrar a sessão.
- Uma sessão encerrada não pode ser reutilizada.
- Sessões inativas devem expirar automaticamente.
- Tratar desconexões e reconexões.
- Não permitir entradas em sessões encerradas.

Definir um limite configurável de espectadores.

## 7. Permissões e segurança

O código público permite solicitar entrada na sessão,
mas não concede privilégios de apresentador.

Ao criar uma sessão, gerar também um token secreto
e criptograficamente seguro para o apresentador.

Regras:

- Nunca expor o token aos espectadores.
- Validar privilégios no backend.
- Somente o apresentador pode encerrar a sessão.
- Utilizar HTTPS em produção.
- Implementar rate limiting nas tentativas de entrada.
- Validar todos os eventos Socket.IO.
- Não registrar tokens ou conteúdo da tela em logs.
- Nunca capturar a tela sem autorização.
- Não implementar controle remoto.

Não considerar validações de frontend suficientes
para garantir a segurança.

## 8. Comunicação em tempo real

Utilizar Socket.IO para:

- Entrada e saída de participantes.
- Sinalização WebRTC.
- Troca de ofertas e respostas SDP.
- Troca de candidatos ICE.
- Atualização de espectadores conectados.
- Notificação de encerramento da sessão.

Utilizar WebRTC para:

- Transmitir vídeo da tela.
- Transmitir áudio, quando habilitado.

Nunca transmitir frames de vídeo por Socket.IO.

Utilizar servidores STUN e prever suporte a TURN.

## 9. Ciclo de vida da transmissão

Estados previstos:

- Sessão criada.
- Aguardando compartilhamento.
- Compartilhamento ativo.
- Compartilhamento interrompido.
- Sessão encerrada.

Quando o apresentador parar o compartilhamento:

- Notificar espectadores.
- Encerrar as trilhas de mídia necessárias.
- Manter a sessão aberta até seu encerramento
  ou expiração, conforme a regra definida.

Se a transmissão terminar pelo navegador,
atualizar corretamente o estado da interface.

## 10. Qualidade do código

- Utilizar TypeScript strict.
- Separar responsabilidades por módulos.
- Evitar funções extensas.
- Evitar duplicação de código.
- Não adicionar dependências desnecessárias.
- Centralizar regras de negócio.
- Validar entradas no backend.
- Tratar erros de rede.
- Tratar falhas de permissão de captura.
- Liberar recursos após desconexões.
- Evitar estados inconsistentes.

## 11. Testes obrigatórios

Testar:

- Criação de sessão.
- Geração e unicidade dos códigos.
- Validação de códigos inválidos.
- Entrada em sessão existente.
- Entrada em sessão encerrada.
- Permissões do apresentador.
- Múltiplos espectadores.
- Desconexão de participantes.
- Encerramento de sessão.
- Falhas de captura de tela.
- Reconexão após queda de conexão.

Validar compartilhamento real entre navegadores
e computadores em redes diferentes.

## 12. Regras para o Codex

Antes de implementar qualquer alteração:

1. Analisar a estrutura existente.
2. Identificar arquivos envolvidos.
3. Verificar padrões já implementados.
4. Explicar a solução proposta.
5. Apontar riscos e impactos.
6. Aguardar autorização explícita.

Durante a implementação:

- Respeitar a arquitetura aprovada.
- Modificar somente o necessário.
- Não implementar funcionalidades não solicitadas.
- Não substituir tecnologias sem autorização.
- Não modificar regras de negócio silenciosamente.

Após implementar:

1. Executar testes disponíveis.
2. Executar lint e build.
3. Informar os arquivos alterados.
4. Resumir as implementações.
5. Informar limitações e problemas pendentes.

## 13. Documentação

Manter atualizados:

- README.md
- docs/ARCHITECTURE.md

Documentar:

- Instalação e execução.
- Arquitetura.
- Fluxo das sessões.
- Eventos Socket.IO.
- Comunicação WebRTC.
- Variáveis de ambiente.
- Limitações conhecidas.

## 14. Princípio principal

Priorizar uma implementação simples,
segura, testável e de fácil manutenção.

Não introduzir complexidade sem necessidade.
