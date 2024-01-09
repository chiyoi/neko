import { Env } from '@/app'
import { WithInteraction } from '@neko03/with-interaction'
import * as discord from 'discord-api-types/v10'
import { IRequest, error, json } from 'itty-router'

export const Echo: discord.RESTPostAPIApplicationCommandsJSONBody = {
  name: 'echo',
  description: 'Echo input message.',
  type: discord.ApplicationCommandType.ChatInput,
  options: [
    {
      type: discord.ApplicationCommandOptionType.String,
      name: 'message',
      description: 'Message to echo.',
      required: true,
    }
  ]
}

export const echo = (request: IRequest & WithInteraction, env: Env) => {
  const { interaction } = request
  if (interaction.type !== discord.InteractionType.ApplicationCommand || interaction.data.type !== discord.ApplicationCommandType.ChatInput) return error(500)
  if (interaction.data.options?.[0].type !== discord.ApplicationCommandOptionType.String || interaction.data.options?.[0].name !== 'message') return error(400, 'Malformed options.')
  const message = interaction.data.options[0].value
  const response: discord.APIInteractionResponse = {
    type: discord.InteractionResponseType.ChannelMessageWithSource,
    data: { content: message },
  }
  return json(response)
}
