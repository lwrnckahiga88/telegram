import { Bot } from "grammy";
import { invokeLLM } from "./_core/llm";
import { ENV } from "./_core/env";
import { wrsRuntime } from "./wrs-os";

// Directly configure the ENV object for the LLM service
ENV.forgeApiKey = process.env.OPENAI_API_KEY || "";
ENV.forgeApiUrl = "https://api.manus.im/api/llm-proxy";

// The token is now securely read from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not configured in .env");
}

export const bot = new Bot(BOT_TOKEN);

// --- Command Handlers ---

bot.command("start", (ctx) => {
  ctx.reply(`Welcome to WRS-OS Federated Agent Marketplace! 🚀

I am your Lodwar Runtime Bot, the command interface for your Enterprise Agent Runtime.

Available Commands:
/market - Browse the Agent Marketplace
/org_list - List your Organizations
/org_create <name> - Create a new WRS Organization
/install <agent_uid> <org_name> - Deploy an agent to an organization
/help - Show all commands`);
});

// Marketplace Command
bot.command("market", async (ctx) => {
  try {
    await wrsRuntime.seedMarketplace(); // Ensure seed data exists
    const agents = await wrsRuntime.listMarketplaceAgents();
    
    if (agents.length === 0) {
      return ctx.reply("The marketplace is currently empty.");
    }

    let response = "🏥 *WRS Agent Marketplace*\n\n";
    agents.forEach(agent => {
      response += `🔹 *${agent.name}* (v${agent.version})\n`;
      response += `ID: \`${agent.agentUid}\`\n`;
      response += `Type: ${agent.type}\n`;
      response += `Description: ${agent.description}\n\n`;
    });
    
    response += "Use `/install <agent_uid> <org_name>` to deploy.";
    await ctx.reply(response, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Marketplace error:", error);
    ctx.reply("Failed to load marketplace.");
  }
});

// Organization Commands
bot.command("org_create", async (ctx) => {
  const orgName = ctx.match;
  if (!orgName) return ctx.reply("Please provide an organization name: `/org_create Lodwar Hospital`", { parse_mode: "Markdown" });

  try {
    // In a real app, we'd get the userId from the telegram account mapping
    // For now, we'll use a placeholder or the first user in DB
    const orgId = await wrsRuntime.createOrganization(orgName, "General", 1);
    ctx.reply(`✅ Organization *${orgName}* created successfully!`, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Org create error:", error);
    ctx.reply("Failed to create organization. It might already exist.");
  }
});

bot.command("org_list", async (ctx) => {
  try {
    const orgs = await wrsRuntime.listOrganizations();
    if (orgs.length === 0) return ctx.reply("You don't have any organizations yet.");

    let response = "🏢 *Your WRS Organizations*\n\n";
    orgs.forEach(org => {
      response += `• *${org.name}* (${org.type}) - ${org.country}\n`;
    });
    await ctx.reply(response, { parse_mode: "Markdown" });
  } catch (error) {
    ctx.reply("Failed to list organizations.");
  }
});

// Install Command
bot.command("install", async (ctx) => {
  const args = ctx.match.split(" ");
  if (args.length < 2) return ctx.reply("Usage: `/install <agent_uid> <org_name>`", { parse_mode: "Markdown" });

  const [agentUid, orgName] = args;

  try {
    const org = await wrsRuntime.getOrganizationByName(orgName);
    if (!org) return ctx.reply(`Organization "${orgName}" not found.`);

    const agent = await wrsRuntime.installAgent(agentUid, org.id);
    ctx.reply(`🚀 *Deployment Started!*\n\nAgent: ${agent.name}\nOrganization: ${org.name}\nStatus: Running`, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Install error:", error);
    ctx.reply(`Failed to install agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// --- AI Chat Handler ---

bot.on("message:text", async (ctx) => {
  const userText = ctx.message.text;
  if (userText.startsWith("/")) return; // Skip commands

  try {
    await ctx.replyWithChatAction("typing");
    
    const result = await invokeLLM({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant running as a Telegram bot named @lodwar_runtime_bot. You are the command interface for WRS-OS, a Federated Agent Marketplace." },
        { role: "user", content: userText }
      ]
    });
    
    const responseText = result.choices[0].message.content;
    
    if (typeof responseText === "string") {
        await ctx.reply(responseText);
    } else {
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

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.endsWith('bot.ts')) {
    startBot();
}
