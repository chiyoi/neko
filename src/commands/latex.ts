import * as discord from 'discord-api-types/v10'

export const Echo: discord.RESTPostAPIApplicationCommandsJSONBody = {
  name: 'Render LaTeX',
  type: discord.ApplicationCommandType.Message,
}
