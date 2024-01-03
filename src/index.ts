import { withAuth } from '@/src/auth'
import { handleInteraction, installCommands, } from '@/src/commands'
import { withInteraction } from '@neko03/with-interaction'
import { Router, error } from 'itty-router'

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => router()
    .handle(request, env, ctx)
    .catch(error),
}

const router = () => {
  const router = Router()
  router.all('/ping', () => new Response('Pong!\n'))
  router.get('/', () => Response.redirect('https://github.com/chiyoi/neko', 307))
  router.post('/interactions', withInteraction, handleInteraction)
  router.post('/install_commands', withAuth, installCommands)
  router.all('*', () => error(404, 'Endpoint not exist.'))
  return router
}

export type Env = {
  DISCORD_APPLICATION_ID: string,
  DISCORD_APPLICATION_PUBLIC_KEY: string,
  DISCORD_APPLICATION_BOT_TOKEN: string,
  ASSISTANT_ID: string,
  OPENAI_API_KEY: string,
  AUTH_SECRET: string,
  GITHUB_ENDPOINT: string,
  QUICK_LATEX_ENDPOINT: string,

  neko: R2Bucket,
}
