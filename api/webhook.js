process.env.NTBA_FIX_319 = 'test';

// Require our Telegram helper package
const TelegramBot = require('node-telegram-bot-api');

module.exports = async (request, response) => {
    try {
        const bot = new TelegramBot("339998513:AAGnf0mcpOmpbPmnyiiIxSoZmzPxV_H-aK4");
        // const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

        // Retrieve the POST request body that gets sent from Telegram
        const { body } = request;

        // Ensure that this is a message being sent
        if (body.message) {
            // Retrieve the ID for this chat
            const { chat: { id }, text, chat: { first_name }, chat: { username }} = body.message;

            let message
            // Set up pre-defined queries
            const opts = {
                reply_markup: JSON.stringify({
                    resize_keyboard: true,
                    one_time_keyboard: true,
                    keyboard: [["Daily Encouragement"],["Useful Links"]]
                })
            };
            switch(text) {
                // Command handlers
                case "/start":
                    message = `Please select your query:`;
                    await bot.sendMessage(id, message, opts, {parse_mode: 'Markdown'});
                    break;
                case "/help":
                    message = 'Hi '+first_name+'! I am MySokaBuddyBot! Let me assist you!!\n\nSend the following commands to get started:\n/start - Lists all the queries I can help you with\n/about - Learn more about me\n/feedback - Tell me how I can improve\n/help - Describes how to use me\n/share - Share me with your fellow members and friends'
                    await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                    break;
                case "/share":
                    message = 'Hello! I am MySokaBuddyBot, a Telegram Bot that can provide encouragement to you:\nhttps://t.me/MySokaBuddyBot'
                    await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                    break;
                case "/about":
                    message = '*About*\nMySokaBuddyBot is a Telegram bot that is aimed at allowing Soka Gakkai members to obtain daily encouragement and links easily and quickly.\n\n*Disclaimer*\nThis bot was created in good faith by a Soka member to be a handy companion to other members and friends and should strictly be used for such purposes only. By using MySokaBuddyBot, you agree to the collection of user data that will only be used for MySokaBuddyBot performance monitoring and to ensure that the bot is used for its intended purpose only. Thank you for your understanding'
                    await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                    break;
                case "/feedback":
                    message = "feedback"
                    await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                    break;

                // Replies based on /start queries
                case "Daily Encouragement":
                    const today = new Date();
                    const date = today.getDate()
                    const month = today.toLocaleString('default', { month: 'long' }).toLowerCase();
                    const baseURL = "https://www.sokaglobal.org/resources/daily-encouragement/"+month+"-"+date+".html"
                    message = baseURL
                    await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                    await bot.sendMessage(id, "Please select your query:", opts);
                    break;
                case "Useful Links":
                    message = '*1) SGI Website*\nhttps://www.sokaglobal.org/\n\n*2) SGS Website*\nhttps://sokasingapore.org/\n\n*3) SGS Instagram*\nhttps://www.instagram.com/soka.singapore/\n\n*4) Nichiren Library*\nhttps://www.nichirenlibrary.org/'
                    await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                    await bot.sendMessage(id, "Please select your query:", opts);
                    break;

                default:
                    message = 'Please type /start first'
                    await bot.sendMessage(id, message);
                    break;
            }
        }
    }
    catch(error) {
        console.error('Error sending message');
        console.log(error.toString());
    }
    
    // Acknowledge the message with Telegram by sending a 200 HTTP status code
    response.send('OK');
};