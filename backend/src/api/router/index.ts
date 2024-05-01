import { FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions } from 'fastify';
import Config from '../../config.js';
import type TelegramBot from 'node-telegram-bot-api';

/**
 * Router options. Our custom plus Fastify's.
 */
interface RouterOptions extends FastifyServerOptions {
  /**
   * Application config instance
   */
  config: typeof Config;

  /**
   * Telegram bot instance
   */
  bot: TelegramBot;
}

/**
 * All routes handlers are defined as a Fastify plugin.
 *
 * @see https://www.fastify.io/docs/latest/Plugins/
 *
 * @param fastify - Fastify instance
 * @param opts - Server options
 */
export default async function router(fastify: FastifyInstance, opts: RouterOptions) {

  const { bot, config } = opts;

  /**
   * Home route for the API: GET /
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply
      .send({
        message: 'Telebook API is ready',
      });
  })

  /**
   * Route for receiving Telegram bot updates (set via setWebHook, @see bot.ts)
   */
  fastify.post(`/bot`, (req, res) => {
    try {
      const update = req.body as TelegramBot.Update;

      if ('message' in update && update.message !== undefined && 'from' in update.message && update.message.from !== undefined) {
        console.log('🤖 ← ', `@${update.message.from.username || (update.message.from.first_name + update.message.from.last_name) }`, update.message.text || '');
      } else {
        console.log('🤖 ← ', update);
      }

      bot.processUpdate(req.body as TelegramBot.Update);
    } catch (e) {
      console.log('error while update processing', e);
    }

    res.code(200).send("OK")
  });
}
