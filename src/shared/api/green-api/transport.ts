export type HttpRequest = {
  method: 'GET' | 'POST' | 'DELETE'

  url: string

  body?: unknown
  signal: AbortSignal
}

export type HttpResponse = { status: number; bodyText: string }

export type HttpTransport = (req: HttpRequest) => Promise<HttpResponse>

export function createFetchTransport(fetchImpl?: typeof fetch): HttpTransport {
  const doFetch: typeof fetch = fetchImpl ?? ((input, init) => fetch(input, init))

  return async ({ method, url, body, signal }) => {
    const init: RequestInit = { method, signal }
    if (method === 'POST') {
      init.headers = { 'Content-Type': 'application/json' }
      init.body = JSON.stringify(body)
    }

    const response = await doFetch(url, init)
    return { status: response.status, bodyText: await response.text() }
  }
}
