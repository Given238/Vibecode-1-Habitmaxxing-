const SESSION_KEY = 'habitmaxxing:session'
const VALID_USER = 'gipeng'
/** SHA-256 of password — client-side only; not secure for production. */
const PASSWORD_HASH = '158bd71a09ceaa6af61597cb812aa57c330a61175f6eefdbd21bcc3d5030496b'

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyLogin(username: string, password: string): Promise<boolean> {
  const user = username.trim().toLowerCase()
  if (user !== VALID_USER) return false
  const hash = await sha256(password)
  return hash === PASSWORD_HASH
}

export type Session = { username: string; loggedInAt: string }

export function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Session
    if (s?.username === VALID_USER) return s
    return null
  } catch {
    return null
  }
}

export function writeSession(username: string) {
  const session: Session = { username, loggedInAt: new Date().toISOString() }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}
