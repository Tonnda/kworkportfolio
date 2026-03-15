import asyncio
import logging
import sys
from os import getenv

from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder

# ВСТАВЬ СЮДА НОВЫЙ ТОКЕН ПОСЛЕ REVOKE В @BotFather
TOKEN = "8488379717:AAHlxOy9vLaXcCirqTuDwIlDeDnNsuG0znU"

dp = Dispatcher()

@dp.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    builder = InlineKeyboardBuilder()
    builder.row(types.InlineKeyboardButton(
        text="⚡ Открыть витрину услуг", 
        web_app=WebAppInfo(url="https://tonnda.github.io/kworkportfolio/")) # Твоя ссылка
    )

    await message.answer(
        f"Привет, {message.from_user.full_name}! 👋\n\n"
        f"Я — бот-ассистент разработчика Tonnda. Нажмите на кнопку ниже, чтобы открыть интерактивный прайс-лист и выбрать нужные услуги.",
        reply_markup=builder.as_markup()
    )

@dp.message(F.web_app_data)
async def web_app_data_handler(message: types.Message) -> None:
    data = message.web_app_data.data
    await message.answer(f"✅ Данные успешно переданы из Web App в бота:\n\n{data}\n\nВ реальном проекте здесь будет интеграция с платежной системой.")

async def main() -> None:
    bot = Bot(token=TOKEN)
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Bot stopped")