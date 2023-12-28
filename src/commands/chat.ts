import { Env } from '@/src'
import { cancelRun, createMessage, createRun, createThread, listMessages, retrieveRun } from '@neko03/openai-requests'
import { WithInteraction, deleteOriginalInteractionResponse, editOriginalInteractionResponse, getChannel } from '@neko03/with-interaction'
import * as discord from 'discord-api-types/v10'
import { IRequest, json } from 'itty-router'

export const Chat: discord.RESTPostAPIApplicationCommandsJSONBody = {
  name: 'chat',
  description: 'Chat with Neko, with GPT-4 at back.',
  type: discord.ApplicationCommandType.ChatInput,
  options: [
    {
      type: discord.ApplicationCommandOptionType.String,
      name: 'message',
      description: 'Your message.',
      required: true,
    }
  ]
}

export async function chat(request: IRequest & WithInteraction, env: Env, ctx: ExecutionContext) {
  ctx.waitUntil(followUp(request, env))
  const response: discord.APIInteractionResponse = { type: discord.InteractionResponseType.DeferredChannelMessageWithSource }
  return json(response)
}

async function followUp(request: IRequest & WithInteraction, env: Env) {
  const { interaction } = request
  if (interaction.type !== discord.InteractionType.ApplicationCommand || interaction.data.type !== discord.ApplicationCommandType.ChatInput) return
  if (interaction.data.options?.[0].type !== discord.ApplicationCommandOptionType.String || interaction.data.options?.[0].name !== 'message') return

  try {
    const channel = await getChannel(interaction.channel.id, env)
    if (channel.type !== discord.ChannelType.GuildText) return
    const category = await getChannel(channel.id, env)
    if (category.type !== discord.ChannelType.GuildCategory || category.name.toLowerCase() !== 'chat with neko') return

    let threadID = await (await env.neko.get(`channels/${channel.id}`))?.text()
    if (threadID === undefined) {
      const thread = await createThread(env, {})
      threadID = thread.id
      await env.neko.put(`channels/${channel.id}`, threadID)
    }

    await createMessage(threadID, env, {
      role: 'user',
      content: interaction.data.options[0].value
    })

    let run = await createRun(threadID, env, { assistant_id: env.ASSISTANT_ID })
    while (true) {
      switch (run.status) {
      case 'queued':
      case 'in_progress':
        break
      case 'requires_action':
        await cancelRun(threadID, run.id, env)
        throw new Error('Unexpected `requires_action`.')
      case 'expired':
      case 'failed':
        throw new Error('Run stopped abnormally.')
      case 'cancelling':
      case 'cancelled':
        await deleteOriginalInteractionResponse(interaction, env)
        return
      case 'completed':
        const pager = await listMessages(threadID, env, { limit: 1 })
        if (pager.data.length !== 1) throw new Error('Expect `pager.data.length === 1`.')
        const message = pager.data[0]
        const plaintext = message.content.reduce((plaintext, paragraph) => paragraph.type === 'text' ? plaintext + paragraph : plaintext, '')
        await editOriginalInteractionResponse(interaction, env, { content: plaintext })
        return
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
      run = await retrieveRun(threadID, run.id, env)
    }
  } catch (error) {
    console.error(error)
    await editOriginalInteractionResponse(interaction, env, {
      content: '[Auto Reply]エラー発生。',
    })
  }
}
