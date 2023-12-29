import { IRequest, error, json } from 'itty-router'
import { Echo, echo } from './echo'
import { Env } from '@/src'
import { WithInteraction, bulkOverwriteGlobalApplicationCommands } from '@neko03/with-interaction'
import * as discord from 'discord-api-types/v10'
import { Chat, chat } from '@/src/commands/chat'
import { Github, github } from '@/src/commands/github'
import { Latex, latex } from '@/src/commands/latex'

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
  case 'github': return github(request, env)
  case 'Render LaTeX': return latex(request, env, ctx)
  default:
    console.error(`Unknown interaction "${interaction.data.name}".`)
    return error(500)
  }
  else {
    console.error(`Unknown interaction type ${interaction.type}.`)
    return error(500)
  }
}

export async function installCommands(request: IRequest, env: Env) {
  return json(await bulkOverwriteGlobalApplicationCommands(env, [Echo, Chat, Github, Latex]))
}
