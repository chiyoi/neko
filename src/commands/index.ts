import { IRequest, error, json } from 'itty-router'
import { Echo, echo } from './echo'
import { Env } from '@/src'
import { WithInteraction, bulkOverwriteGlobalApplicationCommands } from '@neko03/with-interaction'
import * as discord from 'discord-api-types/v10'
import { Chat, chat } from '@/src/commands/chat'
import { Githubcard, githubcard } from '@/src/commands/githubcard'

export async function handleInteraction(request: IRequest & WithInteraction, env: Env, ctx: ExecutionContext) {
  const { interaction } = request
  if (interaction.type === discord.InteractionType.Ping) {
    const response: discord.APIInteractionResponse = {
      type: discord.InteractionResponseType.Pong
    }
    return json(response)
  }
  if (interaction.type === discord.InteractionType.ApplicationCommand) switch (interaction.data.name) {
  case 'echo': return echo(request, env)
  case 'chat': return chat(request, env, ctx)
  case 'githubcard': return githubcard(request, env)
  default:
    console.error(`Unknown interaction type ${interaction.type}`)
    return error(500)
  }
}

export async function installCommands(request: IRequest, env: Env) {
  return json(await bulkOverwriteGlobalApplicationCommands(env, [Echo, Chat, Githubcard]))
}
