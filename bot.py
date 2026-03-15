import asyncio
import logging
import sys
from os import getenv

from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder

# Токен бота — получи его у @BotFather
TOKEN = "8488379717:AAHlxOy9vLaXcCirqTuDwIlDeDnNsuG0znU"

dp = Dispatcher()

@dp.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    """
    Хэндлер на команду /start. Отправляет приветствие и кнопку для открытия Web App.
    """
    builder = InlineKeyboardBuilder()
    # Укажи URL своего хостинга (например, GitHub Pages)
    builder.row(types.InlineKeyboardButton(
        text="Открыть магазин 🛍️", 
        web_app=WebAppInfo(url="https://yourusername.github.io/your-repo/"))
    )

    await message.answer(
        f"Привет, {message.from_user.full_name}! 👋\n\n"
        f"Добро пожаловать в магазин цифровых услуг. Нажми на кнопку ниже, чтобы начать покупки.",
        reply_markup=builder.as_markup()
    )

@dp.message(F.web_app_data)
async def web_app_data_handler(message: types.Message) -> None:
    """
    Хэндлер для получения данных из Web App.
    Данные приходят в формате JSON (или строки), отправленной через Telegram.WebApp.sendData().
    """
    data = message.web_app_data.data
    await message.answer(f"✅ Новый заказ получен!\n\nСостав заказа:\n{data}")

async def main() -> None:
    bot = Bot(token=TOKEN)
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Bot stopped")
