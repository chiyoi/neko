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

export const chat = async (request: IRequest & WithInteraction, env: Env, ctx: ExecutionContext) => {
  ctx.waitUntil(followup(request, env))
  const response: discord.APIInteractionResponse = {
    type: discord.InteractionResponseType.DeferredChannelMessageWithSource,
  }
  return json(response)
}

const followup = async (request: IRequest & WithInteraction, env: Env) => {
  const { interaction } = request
  try {
    if (interaction.type !== discord.InteractionType.ApplicationCommand || interaction.data.type !== discord.ApplicationCommandType.ChatInput) throw new Error(`Unexpected invalid interaction.`)
    if (interaction.data.options?.[0].type !== discord.ApplicationCommandOptionType.String || interaction.data.options?.[0].name !== 'message') throw new Error(`Malformed options.`)

    let threadID = await (await env.neko.get(`chat/channel_thread/${interaction.channel.id}`))?.text()
    if (threadID === undefined) {
      const thread = await createThread(env, {})
      threadID = thread.id
      await env.neko.put(`chat/channel_thread/${interaction.channel.id}`, threadID)
    }

    const message = interaction.data.options[0].value

    await createMessage(threadID, env, {
      role: 'user',
      content: message,
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
        const plaintext = pager.data[0].content.reduce((plaintext, paragraph) => paragraph.type === 'text' ? plaintext + paragraph.text.value : plaintext, '')
        await editOriginalInteractionResponse(interaction, env, { content: `[Prompt]${message}\n\n${plaintext}` })
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
    await new Promise(resolve => setTimeout(resolve, 5000))
    await deleteOriginalInteractionResponse(interaction, env)
  }
}
