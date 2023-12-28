import { withAuth } from '@/src/auth'
import { handleInteraction, installCommands, } from '@/src/commands'
import { withInteraction } from '@neko03/with-interaction'
import { Router, error } from 'itty-router'

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => router()
    .handle(request, env, ctx)
    .catch(error),
}

function router() {
  const router = Router()
  router.all('/ping', () => new Response('Pong!'))

  router.post('/interactions', withInteraction, handleInteraction)
  router.all('/interactions', () => error(405, 'Endpoint <Handle Interaction> is write-only.'))

  router.post('/install_commands', withAuth, installCommands)
  router.all('/install_commands', () => error(405, 'Endpoint <Register Commands> is write-only.'))

  router.all('*', () => error(404, 'Endpoint not exist.'))
  return router
}

export interface Env {
  DISCORD_APPLICATION_ID: string,
  DISCORD_APPLICATION_PUBLIC_KEY: string,
  DISCORD_APPLICATION_BOT_TOKEN: string,
  ASSISTANT_ID: "asst_yEYxwYUPMBSbRPms5sYhw4js", // cspell: disable-line
  OPENAI_API_KEY: string,
  AUTH_SECRET: string,

  neko: R2Bucket,
}
