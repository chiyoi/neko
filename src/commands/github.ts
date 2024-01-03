import { Env } from '@/src'
import { WithInteraction } from '@neko03/with-interaction'
import * as discord from 'discord-api-types/v10'
import { IRequest, error, json } from 'itty-router'

export const Github: discord.RESTPostAPIApplicationCommandsJSONBody = {
  name: 'github',
  description: 'Link to a github repository.',
  type: discord.ApplicationCommandType.ChatInput,
  options: [
    {
      type: discord.ApplicationCommandOptionType.String,
      name: 'repository',
      description: 'Repository reference.',
      required: true,
    }
  ]
}

export const github = (request: IRequest & WithInteraction, env: Env) => {
  const { interaction } = request
  if (interaction.type !== discord.InteractionType.ApplicationCommand || interaction.data.type !== discord.ApplicationCommandType.ChatInput) return error(500, 'Unexpected command type mismatch.')
  if (interaction.data.options?.[0].type !== discord.ApplicationCommandOptionType.String || interaction.data.options?.[0].name !== 'repository') return error(400, 'Malformed options.')
  const repository = interaction.data.options[0].value

  const response: discord.APIInteractionResponse = {
    type: discord.InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `${env.GITHUB_ENDPOINT}/${repository}`,
    },
  }
  return json(response)
}
