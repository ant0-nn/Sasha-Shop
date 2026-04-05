import {
  BadRequestException,
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppService } from './app.service';

interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface TelegramUpdate {
  message?: { chat?: TelegramChat };
  edited_message?: { chat?: TelegramChat };
  channel_post?: { chat?: TelegramChat };
  edited_channel_post?: { chat?: TelegramChat };
  my_chat_member?: { chat?: TelegramChat };
  chat_member?: { chat?: TelegramChat };
  chat_join_request?: { chat?: TelegramChat };
}

interface TelegramGetUpdatesResponse {
  ok: boolean;
  result?: TelegramUpdate[];
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('telegram/chat-ids')
  async getTelegramChatIds(): Promise<{
    chatIds: Array<{
      chatId: string;
      type: string;
      title?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
    }>;
  }> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();

    if (!botToken) {
      throw new BadRequestException('TELEGRAM_BOT_TOKEN is not configured');
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getUpdates`,
    );

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Telegram API responded with ${response.status}`,
      );
    }

    const payload = (await response.json()) as TelegramGetUpdatesResponse;

    if (!payload.ok) {
      throw new ServiceUnavailableException('Telegram API returned ok=false');
    }

    const byChatId = new Map<
      string,
      {
        chatId: string;
        type: string;
        title?: string;
        username?: string;
        firstName?: string;
        lastName?: string;
      }
    >();

    const pushChat = (chat?: TelegramChat) => {
      if (!chat) {
        return;
      }

      byChatId.set(String(chat.id), {
        chatId: String(chat.id),
        type: chat.type,
        title: chat.title,
        username: chat.username,
        firstName: chat.first_name,
        lastName: chat.last_name,
      });
    };

    for (const update of payload.result ?? []) {
      pushChat(update.message?.chat);
      pushChat(update.edited_message?.chat);
      pushChat(update.channel_post?.chat);
      pushChat(update.edited_channel_post?.chat);
      pushChat(update.my_chat_member?.chat);
      pushChat(update.chat_member?.chat);
      pushChat(update.chat_join_request?.chat);
    }

    return {
      chatIds: Array.from(byChatId.values()),
    };
  }
}
