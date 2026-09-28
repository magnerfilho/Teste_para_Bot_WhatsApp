import { START, Workflow } from '@kapso/workflows';

const PHONE_NUMBER_ID = '1283185134887856';
// Tempo máximo de espera pelo toque no botão do menu (5 minutos).
const BUTTON_WAIT_SECONDS = 300;

const workflow = new Workflow('atendimento-bot', {
    name: 'Atendimento Bot',
    status: 'active',
});

workflow.addTrigger({
    type: 'inbound_message',
    phoneNumberId: PHONE_NUMBER_ID,
    active: true,
});

workflow.addNode(START, {
    position: { x: 120, y: 80 },
});

workflow.addNode(
    'menu',
    {
        type: 'send_interactive',
        interactiveType: 'button',
        phoneNumberId: PHONE_NUMBER_ID,
        bodyText: 'Olá! Sou o assistente de atendimento. Como posso ajudar?',
        buttons: [
            { id: 'hours', title: 'Horário' },
            { id: 'contact', title: 'Contato' },
            { id: 'human', title: 'Atendente' },
        ],
    },
    { position: { x: 120, y: 260 } },
);

workflow.addNode(
    'wait_choice',
    {
        type: 'wait_for_response',
        saveResponseTo: 'button_choice',
        timeoutSeconds: BUTTON_WAIT_SECONDS,
    },
    { position: { x: 120, y: 460 } },
);

workflow.addNode(
    'route',
    {
        type: 'decide',
        decisionType: 'function',
        functionSlug: 'decidir-menu',
        conditions: [
            { label: 'hours', description: 'Usuário pediu horário de atendimento' },
            { label: 'contact', description: 'Usuário pediu contato' },
            { label: 'human', description: 'Usuário pediu um atendente' },
        ],
    },
    { position: { x: 120, y: 660 } },
);

workflow.addNode(
    'reply_hours',
    {
        type: 'send_text',
        phoneNumberId: PHONE_NUMBER_ID,
        message: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.',
    },
    { position: { x: 0, y: 860 } },
);

workflow.addNode(
    'reply_contact',
    {
        type: 'send_text',
        phoneNumberId: PHONE_NUMBER_ID,
        message:
            'Você pode falar conosco por este WhatsApp. Se preferir e-mail, responda por aqui que um atendente te passa o contato.',
    },
    { position: { x: 240, y: 860 } },
);

workflow.addNode(
    'reply_human',
    {
        type: 'send_text',
        phoneNumberId: PHONE_NUMBER_ID,
        message:
            'Certo! Vou te encaminhar para um atendente. Em horário comercial, alguém te responde por aqui.',
    },
    { position: { x: 480, y: 860 } },
);

workflow.addEdge(START, 'menu');
workflow.addEdge('menu', 'wait_choice');
workflow.addEdge('wait_choice', 'route');
workflow.addEdge('route', 'reply_hours', { label: 'hours' });
workflow.addEdge('route', 'reply_contact', { label: 'contact' });
workflow.addEdge('route', 'reply_human', { label: 'human' });

export default workflow;
