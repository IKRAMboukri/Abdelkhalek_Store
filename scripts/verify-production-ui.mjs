const DEBUG_ENDPOINT = 'http://127.0.0.1:9222/json/list'
const APP_ORIGIN = 'http://127.0.0.1:5173'

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function waitFor(check, description, timeout = 15_000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (await check()) return
    await delay(100)
  }
  throw new Error(`Timed out waiting for ${description}`)
}

const targets = await fetch(DEBUG_ENDPOINT).then((response) => response.json())
const target = targets.find((candidate) => candidate.type === 'page')
if (!target) throw new Error('No Chrome page target available')

const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let commandId = 0
const pending = new Map()
const apiFailures = []
const consoleErrors = []

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const handler = pending.get(message.id)
    if (!handler) return
    pending.delete(message.id)
    if (message.error) handler.reject(new Error(message.error.message))
    else handler.resolve(message.result)
    return
  }

  if (
    message.method === 'Network.responseReceived' &&
    message.params.response.url.includes('/api/') &&
    message.params.response.status >= 400
  ) {
    apiFailures.push(`${message.params.response.status} ${message.params.response.url}`)
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    consoleErrors.push(message.params.args.map((argument) => argument.value ?? argument.description).join(' '))
  }
})

function command(method, params = {}) {
  const id = ++commandId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? 'Browser evaluation failed')
  }
  return result.result.value
}

async function navigate(path) {
  await command('Page.navigate', { url: `${APP_ORIGIN}${path}` })
  await waitFor(
    () => evaluate(`document.readyState === 'complete' && location.pathname === ${JSON.stringify(path)}`),
    path,
  )
}

await command('Page.enable')
await command('Runtime.enable')
await command('Network.enable')

await navigate('/login')
await waitFor(
  () => evaluate("Boolean(document.querySelector('input[type=email]') && document.querySelector('input[type=password]'))"),
  'login form',
)

const loginResult = await evaluate(`(() => {
  const setValue = (element, value) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
  }
  setValue(document.querySelector('input[type=email]'), 'admin@furniture.com')
  setValue(document.querySelector('input[type=password]'), 'admin1234')
  document.querySelector('form').requestSubmit()
  return true
})()`)
if (!loginResult) throw new Error('Could not submit login form')

await waitFor(() => evaluate("location.pathname === '/'"), 'successful login')
apiFailures.length = 0
consoleErrors.length = 0

const routes = [
  ['dashboard', '/'],
  ['products', '/products'],
  ['customers', '/customers'],
  ['categories', '/categories'],
  ['sales', '/sales'],
  ['invoices', '/invoices'],
  ['credits', '/credits'],
  ['settings', '/settings'],
]

const results = []
for (const [name, path] of routes) {
  await navigate(path)
  await waitFor(() => evaluate("Boolean(document.querySelector('h1'))"), `${name} heading`)
  await delay(500)
  const result = await evaluate(`({
    title: document.querySelector('h1')?.textContent?.trim() ?? '',
    errorBoundary: document.body.textContent.includes('Something went wrong'),
    pagination: Boolean(document.querySelector('[aria-label="Next page"]')),
  })`)
  if (!result.title || result.errorBoundary) throw new Error(`${name} did not render successfully`)
  results.push({ name, path, ...result })
}

if (apiFailures.length) throw new Error(`API failures:\n${apiFailures.join('\n')}`)
if (consoleErrors.length) throw new Error(`Console errors:\n${consoleErrors.join('\n')}`)

for (const result of results) {
  console.log(`PASS ${result.name} ${result.path}: ${result.title}${result.pagination ? ' [pagination rendered]' : ''}`)
}

socket.close()
