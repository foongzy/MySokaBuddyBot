process.env.NTBA_FIX_319 = 'test';
import axios from 'axios'

// Require our Telegram helper package
const TelegramBot = require('node-telegram-bot-api');

async function dbSend(baseURL, first_name, username, id, action) {
    const URL=baseURL+"/api/mysokabuddybot/"+id+"/"+action
    const data={
        "username": username,
        "firstname": first_name,
        "convoState": action
    }
    const res = await axios.post(URL, data)
    return res;
  }

module.exports = async (request, response) => {
    try {
        const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

        // Retrieve the POST request body that gets sent from Telegram
        const { body } = request;
        const baseURL="https://telegrambotsdb.pythonanywhere.com"

        // Ensure that this is a message being sent
        if (body.message) {
            // Retrieve the ID for this chat
            const { chat: { id }, text, chat: { first_name }, chat: { username }} = body.message;
            let message

            // Check state of convo
            const res = await dbSend(baseURL, first_name, username, id, "ping")
            if (res.status==200){
                if (res.data.convoState=="feedback" && text!="/start"){
                    // Check if text fits requirements
                    if(text.length>=5 && text.length<=500 && text!="/cancel" && text!="Daily Encouragement" && text!="Useful Links"){
                        const feedbackURL=baseURL+"/api/mysokabuddybot/"+id+"/feedbackSubmit"
                        const feedbackData={
                            "username": username,
                            "firstname": first_name,
                            "feedback": text
                        }
                        const res = await axios.post(feedbackURL, feedbackData)
                        if (res.status==201){
                            message = `Thank you for your feedback`;
                        }else{
                            message = `Failed to submit feedback. Please try again later`;
                        }
                        await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                    }else if(text=="/cancel"){
                        const res = await dbSend(baseURL, first_name, username, id, "cancel")
                        if (res.status==200){
                            message = `Feedback cancelled. Type /start to begin again`;
                        }else{
                            message = `Failed to cancel feedback. Try again later`;
                        }
                        await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                    }else{
                        message = "Feedback needs to be longer than 5 characters and shorter than 500 characters and cannot be one of the queries. Your given feedback is "+text.length+" characters long. Type /cancel to cancel feedback"
                        await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                    }
                }else{
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
                            const resStart = await dbSend(baseURL, first_name, username, id, "start")
                            break;
                        case "/help":
                            message = 'Hi '+first_name+'! I am MySokaBuddyBot! Let me assist you!!\n\nSend the following commands to get started:\n/start - Lists all the queries I can help you with\n/about - Learn more about me\n/feedback - Tell me how I can improve\n/help - Describes how to use me\n/share - Share me with your fellow members and friends'
                            await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                            const resHelp = await dbSend(baseURL, first_name, username, id, "help")
                            break;
                        case "/share":
                            message = 'Hello! I am MySokaBuddyBot, a Telegram Bot that can provide daily encouragement and information to you:\nhttps://t.me/MySokaBuddyBot'
                            await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                            const resShare = await dbSend(baseURL, first_name, username, id, "share")
                            break;
                        case "/about":
                            message = '*About*\nMySokaBuddyBot is a Telegram bot that allows Soka Gakkai members to obtain daily encouragement and information easily and quickly.\n\n*Disclaimer*\nThis bot was created in good faith by a Soka member to be a handy companion to other members and friends and should strictly be used for such purposes only. By using MySokaBuddyBot, you agree to the collection of user data that will only be used for MySokaBuddyBot performance monitoring and to ensure that the bot is used for its intended purpose only. Thank you for your understanding.'
                            await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                            const resAbout = await dbSend(baseURL, first_name, username, id, "about")
                            break;
                        case "/feedback":
                            message = "Please type your feedback:"
                            const resFeedback = await dbSend(baseURL, first_name, username, id, "feedback")
                            await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                            break;

                        // Replies based on /start queries
                        case "Daily Encouragement":
                            const today = new Date();
                            const date = today.getDate()
                            const month = today.toLocaleString('default', { month: 'long' }).toLowerCase();
                            const encourageURL = "https://www.sokaglobal.org/resources/daily-encouragement/"+month+"-"+date+".html"
                            message = encourageURL
                            await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                            await bot.sendMessage(id, "Please select your query:", opts);
                            const dailyEncouragement = await dbSend(baseURL, first_name, username, id, "dailyEncourage")
                            break;
                        case "Useful Links":
                            message = '*1) SGI Website*\nhttps://www.sokaglobal.org/\n\n*2) SGS Website*\nhttps://sokasingapore.org/\n\n*3) SGS Instagram*\nhttps://www.instagram.com/soka.singapore/\n\n*4) Nichiren Library*\nhttps://www.nichirenlibrary.org/'
                            await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
                            await bot.sendMessage(id, "Please select your query:", opts);
                            const usefulLinks = await dbSend(baseURL, first_name, username, id, "usefulLinks")
                            break;

                        default:
                            message = 'Please type /start first'
                            await bot.sendMessage(id, message);
                            break;
                    }
                }
            }else{
                message="Server error. Please try again later"
                await bot.sendMessage(id, message);
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