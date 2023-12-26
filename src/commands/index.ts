import { IRequest } from 'itty-router'
import { Echo, echo } from './echo'
import { Env } from '@/src'
import { WithInteraction, installGlobalCommands } from '@neko03/with-interaction'
import { InteractionType } from 'discord-api-types/v10'

export async function handleCommand(request: IRequest & WithInteraction, env: Env) {
  const { interaction } = request
  if (interaction.type === InteractionType.ApplicationCommand) switch (interaction.data.name) {
  case 'echo': echo(request, env); break
  }
}

export async function installCommands(request: IRequest, env: Env) {
  const commands = [Echo]
  console.debug('Ready to install.')
  const response = await installGlobalCommands(commands, env)
  console.debug('pass')
  return response
}
