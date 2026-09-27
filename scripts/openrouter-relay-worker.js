// Cloudflare Worker: пересылает запросы к OpenRouter с сервера в РФ, где OpenRouter закрыт.
//
// 1. dash.cloudflare.com → Workers & Pages → Create → Worker, вставить этот файл, Deploy.
// 2. Settings → Variables and Secrets → добавить секрет RELAY_SECRET (любая длинная строка).
// 3. На сервере сайта:
//      OPENROUTER_BASE_URL=https://<имя-воркера>.<аккаунт>.workers.dev/api/v1
//      OPENROUTER_RELAY_SECRET=<тот же RELAY_SECRET>
//
// Без секрета воркер ничего не пересылает, чтобы им не пользовались посторонние.

const relay = {
  async fetch(request, env) {
    if (!env.RELAY_SECRET || request.headers.get('X-Relay-Secret') !== env.RELAY_SECRET) {
      return new Response('Relay: wrong X-Relay-Secret', { status: 403 })
    }

    const url = new URL(request.url)
    if (!url.pathname.startsWith('/api/v1/')) {
      return new Response('Relay: not found', { status: 404 })
    }

    // Только нужные заголовки: X-Forwarded-For / CF-Connecting-IP выдали бы OpenRouter
    // российский IP сервера, и он снова ответил бы 403
    const headers = new Headers()
    for (const name of ['Authorization', 'Content-Type', 'Accept', 'HTTP-Referer', 'X-Title']) {
      const value = request.headers.get(name)
      if (value) headers.set(name, value)
    }

    return fetch(`https://openrouter.ai${url.pathname}${url.search}`, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    })
  },
}

export default relay
