# Bot de atendimento WhatsApp (Kapso)

Bot de menu para WhatsApp Business. Não é agente de IA: a conversa segue um workflow publicado no [Kapso](https://kapso.ai).

Quando o cliente manda mensagem para o número conectado, o Kapso dispara o fluxo **Atendimento Bot**: menu com Horário, Contato e Atendente, e respostas fixas.

Há também um webhook legado na Vercel (`api/webhook.js`). O atendimento atual **não** passa por ele.

## Como funciona

```text
Celular → Meta Cloud API → Kapso → workflow atendimento-bot → menu / respostas
