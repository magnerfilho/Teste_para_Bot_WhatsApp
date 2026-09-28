async function handler(request, env) {
    const payload = await request.json();
    const executionContext = payload?.execution_context ?? {};
    const vars = executionContext.vars ?? {};
    const availableEdges = Array.isArray(payload?.available_edges) ? payload.available_edges : [];
    const raw = vars.button_choice ?? vars.last_user_input;
    const extracted = extractChoice(raw);
    const mapped = mapChoice(extracted);

    if (mapped && availableEdges.includes(mapped)) {
        return jsonResponse({ next_edge: mapped });
    }

    const fallback = availableEdges.includes('hours') ? 'hours' : availableEdges[0] || 'next';

    return jsonResponse({
        next_edge: fallback,
        vars: {
            decision_reason: {
                extracted,
                raw_preview: asString(raw),
                available_edges: availableEdges,
            },
        },
    });
}

function jsonResponse(body) {
    return new Response(JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
    });
}

function asString(value) {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    if (value && typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return null;
        }
    }

    return null;
}

function extractChoice(value) {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    if (typeof value === 'object') {
        const direct = value.button_id || value.buttonId || value.list_id || value.listId || value.id || value.choice || value.value;
        if (typeof direct === 'string' && direct.trim().length > 0) {
            return direct.trim();
        }

        const nested =
            (value.interactive && (value.interactive.button_reply || value.interactive.list_reply)) ||
            value.button_reply ||
            value.list_reply;

        if (nested && typeof nested === 'object') {
            const nestedId = nested.id || nested.button_id || nested.list_id;
            if (typeof nestedId === 'string' && nestedId.trim().length > 0) {
                return nestedId.trim();
            }
        }
    }

    return null;
}

function mapChoice(extracted) {
    if (!extracted) {
        return null;
    }

    const normalized = extracted
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    if (normalized === 'hours' || normalized === 'horario' || normalized === 'horarios') {
        return 'hours';
    }

    if (normalized === 'contact' || normalized === 'contato' || normalized === 'email' || normalized === 'telefone') {
        return 'contact';
    }

    if (normalized === 'human' || normalized === 'atendente' || normalized === 'humano' || normalized === 'pessoa') {
        return 'human';
    }

    return normalized;
}
