
const SOURCE_NAMES = {
    home: 'Головна сторінка',
    contact: 'Контакти',
    quiz: 'Тест підбору'
};

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
        }
    });
}

function clean(value, maxLength = 1000) {
    return typeof value === 'string'
        ? value.trim().slice(0, maxLength)
        : '';
}

async function handleLead(request, env) {
    if (request.method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed' }, 405);
    }

    // Accept submissions from the site's own origin.
    const origin = request.headers.get('Origin');

    if (origin && origin !== new URL(request.url).origin) {
        return json({ ok: false, error: 'Forbidden' }, 403);
    }

    if (!request.headers.get('Content-Type')?.includes('application/json')) {
        return json({ ok: false, error: 'Invalid content type' }, 415);
    }

    // Basic abuse protection.
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    const limit = await env.LEAD_LIMIT.limit({
        key: `lead:${ip}`
    });

    if (!limit.success) {
        return json({
            ok: false,
            error: 'Too many requests'
        }, 429);
    }

    let body;

    try {
        const raw = await request.text();

        if (raw.length > 12000) {
            return json({ ok: false, error: 'Payload too large' }, 413);
        }

        body = JSON.parse(raw);
    } catch {
        return json({ ok: false, error: 'Invalid JSON' }, 400);
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return json({ ok: false, error: 'Invalid data' }, 400);
    }

    // Honeypot: bots may fill this invisible field.
    if (body.website) {
        return json({ ok: true });
    }

    const source = clean(body.source, 30);
    const name = clean(body.name, 100);
    const email = clean(body.email, 254);
    const phone = clean(body.phone, 40);
    const packageName = clean(body.packageName, 100);
    const message = clean(body.message, 2000);
    const quizDetails = clean(body.quizDetails, 4500);

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (
        !SOURCE_NAMES[source] ||
        name.length < 2 ||
        !emailValid ||
        body.acceptedPrivacy !== true
    ) {
        return json({
            ok: false,
            error: 'Please check your form fields'
        }, 422);
    }

    if (!env.RESEND_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) {
        console.error('Email environment variables are missing');

        return json({
            ok: false,
            error: 'Email service is not configured'
        }, 503);
    }

    const subject =
        `[NewGen Study] Нова заявка — ${SOURCE_NAMES[source]}`;

    const emailText = [
        'НОВА ЗАЯВКА — NEWGEN STUDY',
        '================================',
        '',
        `Джерело: ${SOURCE_NAMES[source]}`,
        `Ім’я: ${name}`,
        `Email: ${email}`,
        `Телефон: ${phone || 'Не вказано'}`,
        `Пакет: ${packageName || 'Не обрано'}`,
        '',
        'Повідомлення:',
        message || 'Не вказано',
        '',
        ...(quizDetails
            ? [
                'РЕЗУЛЬТАТИ ТЕСТУ',
                '================================',
                quizDetails,
                ''
            ]
            : []),
        `Час (UTC): ${new Date().toISOString()}`
    ].join('\n');

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: env.MAIL_FROM,
                to: [env.MAIL_TO],
                reply_to: email,
                subject,
                text: emailText
            })
        });

        if (!response.ok) {
            const errorText = await response.text();

            console.error(
                'Resend error:',
                response.status,
                errorText.slice(0, 500)
            );

            return json({
                ok: false,
                error: 'Email provider rejected the request'
            }, 502);
        }

        return json({ ok: true });
    } catch (error) {
        console.error('Email request failed:', error);

        return json({
            ok: false,
            error: 'Email service temporarily unavailable'
        }, 502);
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/api/lead') {
            return handleLead(request, env);
        }

        return env.ASSETS.fetch(request);
    }
};
