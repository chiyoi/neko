import { Env } from '@/src'
import { WithInteraction } from '@neko03/with-interaction'
import * as discord from 'discord-api-types/v10'
import { IRequest, error, json } from 'itty-router'

export const Githubcard: discord.RESTPostAPIApplicationCommandsJSONBody = {
  name: 'githubcard',
  description: 'Get the githubcard for a repository.',
  type: discord.ApplicationCommandType.ChatInput,
  options: [
    {
      type: discord.ApplicationCommandOptionType.String,
      name: 'repository',
      description: 'Repository reference like `golang/go`.',
      required: true,
    }
  ]
}

export async function githubcard(request: IRequest & WithInteraction, env: Env) {
  const { interaction } = request
  if (interaction.type !== discord.InteractionType.ApplicationCommand || interaction.data.type !== discord.ApplicationCommandType.ChatInput) return error(500)
  if (interaction.data.options?.[0].type !== discord.ApplicationCommandOptionType.String || interaction.data.options?.[0].name !== 'repository') return error(400, 'Malformed options.')
  const repository = interaction.data.options[0].value
  const payload: discord.APIInteractionResponse = {
    type: discord.InteractionResponseType.ChannelMessageWithSource,
    data: {
      embeds: [{
        image: { url: `${env.GITHUBCARD_ENDPOINT}/${repository}` },
      }]
    },
  }
  return json(payload)
}
