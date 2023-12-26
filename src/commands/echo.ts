import { Env } from '@/src'
import { WithInteraction } from '@neko03/with-interaction'
import { APIApplicationCommand, APIInteractionResponse, ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType, InteractionType } from 'discord-api-types/v10'
import { IRequest, json } from 'itty-router'

export const Echo: Partial<APIApplicationCommand> = {
  name: 'Echo',
  description: 'Echo input message.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'message',
      description: 'Message to echo.',
      required: true,
    }
  ]
}

export function echo(request: IRequest & WithInteraction, env: Env) {
  const { interaction } = request
  if (interaction.type !== InteractionType.ApplicationCommand || interaction.data.type !== ApplicationCommandType.ChatInput) return
  if (interaction.data.options?.[0].type !== ApplicationCommandOptionType.String || interaction.data.options?.[0].name !== 'message') return
  const message = interaction.data.options[0].value
  const response: APIInteractionResponse = {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: message,
    },
  }
  return json(response)
}
