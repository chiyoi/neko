import { Env } from '@/app'
import { IRequest, error } from 'itty-router'

export const withAuth = (request: IRequest, env: Env) => {
  const [scheme, token] = request.headers.get('Authorization')?.split(' ') ?? []
  if (scheme !== 'Secret') return error(401, 'Missing or malformed authorization token.')
  const encoder = new TextEncoder()
  if (token.length !== env.AUTH_SECRET.length || !crypto.subtle.timingSafeEqual(encoder.encode(token), encoder.encode(env.AUTH_SECRET))) return error(403, 'Invalid secret.')
}
