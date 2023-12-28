import { IRequest, json } from 'itty-router'
import { Echo, echo } from './echo'
import { Env } from '@/src'
import { WithInteraction, bulkOverwriteGlobalApplicationCommands } from '@neko03/with-interaction'
import * as discord from 'discord-api-types/v10'
import { Chat } from '@/src/commands/chat'

export async function handleInteraction(request: IRequest & WithInteraction, env: Env) {
  const { interaction } = request
  if (interaction.type === discord.InteractionType.Ping) {
    const response: discord.APIInteractionResponse = {
      type: discord.InteractionResponseType.Pong
    }
    return json(response)
  }
  if (interaction.type === discord.InteractionType.ApplicationCommand) switch (interaction.data.name) {
  case 'echo': return echo(request, env)
  }
}

export async function installCommands(request: IRequest, env: Env) {
  return await bulkOverwriteGlobalApplicationCommands(env, [Echo, Chat])
}
