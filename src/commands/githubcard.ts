import { Env } from '@/src'
import { WithInteraction } from '@neko03/with-interaction'
import * as api from 'discord-api-types/v10'
import { IRequest, error, json } from 'itty-router'


export const Githubcard: api.RESTPostAPIApplicationCommandsJSONBody = {
  name: 'githubcard',
  description: 'Get the githubcard for a repository.',
  type: api.ApplicationCommandType.ChatInput,
  options: [
    {
      type: api.ApplicationCommandOptionType.String,
      name: 'repository',
      description: 'Repository reference like `golang/go`.',
      required: true,
    }
  ]
}

export async function githubcard(request: IRequest & WithInteraction, env: Env) {
  const { interaction } = request
  if (interaction.type !== api.InteractionType.ApplicationCommand || interaction.data.type !== api.ApplicationCommandType.ChatInput) return error(500)
  if (interaction.data.options?.[0].type !== api.ApplicationCommandOptionType.String || interaction.data.options?.[0].name !== 'repository') return error(400, 'Malformed options.')
  const repository = interaction.data.options[0].value
  const response: api.APIInteractionResponse = {
    type: api.InteractionResponseType.ChannelMessageWithSource,
    data: {
      embeds: [{
        url: `${env.GITHUBCARD_ENDPOINT}/${repository}`,
      }],
    },
  }
  return json(response)
}
