import { Env } from '@/src'
import { WithInteraction, editMessage } from '@neko03/with-interaction'
import * as discord from 'discord-api-types/v10'
import { IRequest, error, json } from 'itty-router'

export const Latex: discord.RESTPostAPIApplicationCommandsJSONBody = {
  name: 'Render LaTeX',
  type: discord.ApplicationCommandType.Message,
}

export async function latex(request: IRequest & WithInteraction, env: Env) {
  const { interaction } = request
  if (interaction.type !== discord.InteractionType.ApplicationCommand || interaction.data.type !== discord.ApplicationCommandType.Message) return error(500)
  for (const messageID in interaction.data.resolved.messages) {
    const message = interaction.data.resolved.messages[messageID]
    const quickLatex = await fetch(env.QUICK_LATEX_ENDPOINT, {
      method: 'POST',
      body: `formula=${message.content}`,
    })
    console.debug('Got quick latex.')
    const [status, data] = (await quickLatex.text()).split('\n')
    if (status !== '0') return error(500, 'Quick Latex returned error.')
    const [u] = data.split(' ')
    console.debug(`Got url: ${u}`)

    const payload: discord.RESTPatchAPIChannelMessageJSONBody = {
      embeds: [{
        image: { url: u },
      }],
    }
    await editMessage(interaction.channel, message, env, payload)
  }

  const response: discord.APIInteractionResponse = {
    type: discord.InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: 'Edited.',
    },
  }
  return json(response)
}

async function followUp
