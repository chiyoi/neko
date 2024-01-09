import { Env } from '@/app'
import { WithInteraction, deleteMessage, deleteOriginalInteractionResponse, editMessage, editOriginalInteractionResponse } from '@neko03/with-interaction'
import * as discord from 'discord-api-types/v10'
import { IRequest, json } from 'itty-router'

export const Latex: discord.RESTPostAPIApplicationCommandsJSONBody = {
  name: 'Render LaTeX',
  type: discord.ApplicationCommandType.Message,
}

export const latex = async (request: IRequest & WithInteraction, env: Env, ctx: ExecutionContext) => {
  ctx.waitUntil(followup(request, env))
  const response: discord.APIInteractionResponse = {
    type: discord.InteractionResponseType.DeferredChannelMessageWithSource,
  }
  return json(response)
}

const followup = async (request: IRequest & WithInteraction, env: Env) => {
  const { interaction } = request
  try {
    if (interaction.type !== discord.InteractionType.ApplicationCommand || interaction.data.type !== discord.ApplicationCommandType.Message) throw new Error(`Unexpected interaction type mismatch.`)
    for (const messageID in interaction.data.resolved.messages) {
      const message = interaction.data.resolved.messages[messageID]
      const content = message.content
      const info = await (await fetch(env.QUICK_LATEX_ENDPOINT, {
        method: 'POST',
        body: `formula=${content}`,
      }))?.text()
      const [status, data] = info.split('\r\n')
      if (status !== '0') throw new Error('Quick Latex returned error.')
      const [url] = data.split(' ')

      const oldMessageID = await (await env.neko.get(`latex/old_messages/${message.id}`))?.text()
      if (oldMessageID !== undefined) await deleteMessage(interaction.channel, { id: oldMessageID }, env)

      const reply = await editOriginalInteractionResponse(interaction, env, {
        content,
        embeds: [{
          image: { url },
          color: 0xffffff,
          footer: {
            icon_url: 'https://quicklatex.com/images/ql_logo.gif',
            text: 'Powered by quicklatex.com',
          },
        }],
      })
      await env.neko.put(`latex/old_messages/${message.id}`, reply.id)
    }
  } catch (error) {
    console.error(error)
    await editOriginalInteractionResponse(interaction, env, {
      content: '[Auto Reply]エラー発生。',
    })
    await new Promise(resolve => setTimeout(resolve, 5000))
    await deleteOriginalInteractionResponse(interaction, env)
  }
}
