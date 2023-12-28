import { Env } from '@/src'
import { WithInteraction } from '@neko03/with-interaction'
import * as api from 'discord-api-types/v10'
import { IRequest, json } from 'itty-router'

export const Echo: api.RESTPostAPIApplicationCommandsJSONBody = {
  name: 'echo',
  description: 'Echo input message.',
  type: api.ApplicationCommandType.ChatInput,
  options: [
    {
      type: api.ApplicationCommandOptionType.String,
      name: 'message',
      description: 'Message to echo.',
      required: true,
    }
  ]
}

export function echo(request: IRequest & WithInteraction, env: Env) {
  const { interaction } = request
  if (interaction.type !== api.InteractionType.ApplicationCommand || interaction.data.type !== api.ApplicationCommandType.ChatInput) return
  if (interaction.data.options?.[0].type !== api.ApplicationCommandOptionType.String || interaction.data.options?.[0].name !== 'message') return
  const message = interaction.data.options[0].value
  const response: api.APIInteractionResponse = {
    type: api.InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: message,
    },
  }
  const r1: api.APIInteractionResponse = {
    type: api.InteractionResponseType.UpdateMessage
  }
  return json(response)
}
