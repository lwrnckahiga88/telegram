import { Bot } from "grammy";
import { invokeLLM } from "./_core/llm";

// The token provided by the user
const BOT_TOKEN = "8991065272:AAHpJ6jU-cHpEiUvzpKUg2P-verU09Mo2gY";

if (!BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not configured");
}

export const bot = new Bot(BOT_TOKEN);

// Basic command handlers
bot.command("start", (ctx) => ctx.reply("Welcome! I am your Lodwar Runtime Bot. How can I help you today?"));
bot.command("help", (ctx) => ctx.reply("Send me any message and I will respond using my AI capabilities."));

// Handle text messages using the project's LLM service
bot.on("message:text", async (ctx) => {
  const userText = ctx.message.text;
  
  try {
    // Show typing status
    await ctx.replyWithChatAction("typing");
    
    // Call the project's built-in LLM service
    const result = await invokeLLM({
      messages: [
        { role: "system", content: "You are a helpful assistant running as a Telegram bot named @lodwar_runtime_bot." },
        { role: "user", content: userText }
      ]
    });
    
    const responseText = result.choices[0].message.content;
    
    if (typeof responseText === "string") {
        await ctx.reply(responseText);
    } else {
        // Handle array content if necessary
        const text = responseText.map(part => part.type === 'text' ? part.text : '').join('\n');
        await ctx.reply(text || "I received a non-text response from the AI.");
    }
    
  } catch (error) {
    console.error("Error calling LLM:", error);
    await ctx.reply("Sorry, I encountered an error while processing your request.");
  }
});

// Start the bot
export function startBot() {
  bot.start({
    onStart: (botInfo) => {
      console.log(`Bot @${botInfo.username} is up and running!`);
    },
  });
}

// If this file is run directly
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.endsWith('bot.ts')) {
    startBot();
}
