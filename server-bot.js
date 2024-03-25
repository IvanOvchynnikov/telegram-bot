const OpenAI = require('openai');

const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')

const bot = new Telegraf(process.env.BOT_TOKEN)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// feat: Added logging for ChatGPT API errors
async function getChatGPTResponse(prompt) {
    try {
        const response = await openai.complete({
            engine: 'gpt-3.5-turbo',
            prompt: prompt,
            maxTokens: 100 // Змініть за потребою
        });
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error occurred while fetching response from ChatGPT API:', error); // Додано логування помилок
        return 'Вибачте, сталася помилка. Будь ласка, спробуйте пізніше.';
    }
}


bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
// feat(bot): Added sticker response
bot.on(message('sticker'), (ctx) => ctx.reply('👍')); // Додано відповідь на стікери
bot.hears('hi', (ctx) => ctx.reply('Hey there'))


// Обробник вхідних повідомлень бота
bot.hears('gpt', async (ctx) => {
    const userMessage = ctx.message.text;

    // Отримуємо відповідь від ChatGPT за допомогою введеного повідомлення користувача
    const chatGPTResponse = await getChatGPTResponse(userMessage);

    // Надсилаємо отриману відповідь користувачеві
    ctx.reply(chatGPTResponse);
});

// fix: Fixed webhook configuration
bot.launch({
    webhook: {
        domain: process.env.WEBHOOK_DOMAIN || 'localhost', // Змінено значення за замовчуванням
        port: process.env.PORT || 3000, // Змінено значення за замовчуванням
    },
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
