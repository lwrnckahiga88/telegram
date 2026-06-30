import "dotenv/config";
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

// --- Middleware: Ensure Marketplace is Seeded ---
bot.use(async (ctx, next) => {
  await wrsRuntime.seedInitialData();
  await next();
});

// --- Command Handlers ---

bot.command("start", (ctx) => {
  ctx.reply(`Welcome to WRS-OS Federated Agent Marketplace! 🚀

I am your Lodwar Runtime Bot, the command interface for your Enterprise Agent Runtime.

*Marketplace Commands:*
/market - Browse the Agent Marketplace
/search <query> - Search for specific agents
/install <agent_uid> <org_name> - Deploy an agent to an organization

*Organization Commands:*
/org_list - List your Organizations
/org_create <name> <type> - Create a new WRS Organization
/org_status <org_name> - Check federation and agent status

*Help:*
/help - Show all commands`, { parse_mode: "Markdown" });
});

bot.command("help", (ctx) => {
  ctx.reply(`*WRS-OS Command Reference*

*Marketplace*
• \`/market\` - List all published agents
• \`/search <query>\` - Find agents by name or type
• \`/install <agent_uid> <org_name>\` - Install agent to organization

*Organizations*
• \`/org_list\` - View all organizations you belong to
• \`/org_create <name> <type>\` - Create a new organization (e.g., /org_create "Lodwar Hospital" Hospital)
• \`/org_status <org_name>\` - Detailed health and federation status

*Federation*
• \`/fed_status <org_name>\` - Check peer connections and sync status

*Agent Lifecycle*
• \`/agents <org_name>\` - List agents running in an organization`, { parse_mode: "Markdown" });
});

// Marketplace & Search
bot.command("market", async (ctx) => {
  try {
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

bot.command("search", async (ctx) => {
  const query = ctx.match;
  if (!query) return ctx.reply("Please provide a search term: `/search nurse`", { parse_mode: "Markdown" });

  try {
    const results = await wrsRuntime.searchAgents(query);
    if (results.length === 0) return ctx.reply(`No agents found matching "${query}".`);

    let response = `🔍 *Search Results for "${query}"*\n\n`;
    results.forEach(agent => {
      response += `🔹 *${agent.name}* (\`${agent.agentUid}\`)\n`;
      response += `Type: ${agent.type}\n\n`;
    });
    await ctx.reply(response, { parse_mode: "Markdown" });
  } catch (error) {
    ctx.reply("Search failed.");
  }
});

// Organization Management
bot.command("org_create", async (ctx) => {
  const args = ctx.match.split(" ");
  if (args.length < 1) return ctx.reply("Usage: `/org_create <name> [type]`", { parse_mode: "Markdown" });

  const name = args[0];
  const type = args[1] || "General";

  try {
    const orgId = await wrsRuntime.createOrganization(name, type, 1);
    ctx.reply(`✅ Organization *${name}* created successfully!\nID: ${orgId}`, { parse_mode: "Markdown" });
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

bot.command("org_status", async (ctx) => {
  const orgName = ctx.match;
  if (!orgName) return ctx.reply("Usage: `/org_status <org_name>`");

  try {
    const org = await wrsRuntime.getOrganizationByName(orgName);
    if (!org) return ctx.reply(`Organization "${orgName}" not found.`);

    const fed = await wrsRuntime.getFederationStatus(org.id);
    const installed = await wrsRuntime.listOrgAgents(org.id);

    let response = `📊 *Status: ${org.name}*\n\n`;
    response += `*Federation:* ${fed?.status || 'Inactive'}\n`;
    response += `*Peers:* ${fed?.peers || 0}\n`;
    response += `*Last Sync:* ${fed?.lastSync.toLocaleString() || 'Never'}\n\n`;
    
    response += `*Deployed Agents:* ${installed.length}\n`;
    installed.forEach(a => {
      response += `• ${a.name} (${(a as any).deploymentStatus})\n`;
    });

    await ctx.reply(response, { parse_mode: "Markdown" });
  } catch (error) {
    ctx.reply("Failed to get status.");
  }
});

// Install & Deployment
bot.command("install", async (ctx) => {
  const args = ctx.match.split(" ");
  if (args.length < 2) return ctx.reply("Usage: `/install <agent_uid> <org_name>`", { parse_mode: "Markdown" });

  const [agentUid, orgName] = args;

  try {
    const org = await wrsRuntime.getOrganizationByName(orgName);
    if (!org) return ctx.reply(`Organization "${orgName}" not found.`);

    const agent = await wrsRuntime.installAgent(agentUid, org.id);
    ctx.reply(`🚀 *Deployment Started!*\n\nAgent: ${agent.name}\nOrganization: ${org.name}\nStatus: Running\nFederated: ${agent.isFederated ? 'Yes' : 'No'}`, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Install error:", error);
    ctx.reply(`Failed to install agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

bot.command("agents", async (ctx) => {
  const orgName = ctx.match;
  if (!orgName) return ctx.reply("Usage: `/agents <org_name>`");

  try {
    const org = await wrsRuntime.getOrganizationByName(orgName);
    if (!org) return ctx.reply(`Organization "${orgName}" not found.`);

    const agents = await wrsRuntime.listOrgAgents(org.id);
    if (agents.length === 0) return ctx.reply(`No agents deployed in ${orgName}.`);

    let response = `🤖 *Agents in ${orgName}*\n\n`;
    agents.forEach(a => {
      response += `• *${a.name}* (v${a.version})\n`;
      response += `  Status: ${(a as any).deploymentStatus}\n`;
      response += `  Installed: ${(a as any).installedAt.toLocaleDateString()}\n\n`;
    });

    await ctx.reply(response, { parse_mode: "Markdown" });
  } catch (error) {
    ctx.reply("Failed to list agents.");
  }
});

// --- AI Chat Handler ---
bot.on("message:text", async (ctx) => {
  const userText = ctx.message.text;
  if (userText.startsWith("/")) return; 

  try {
    await ctx.replyWithChatAction("typing");
    
    const result = await invokeLLM({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant running as a Telegram bot named @lodwar_runtime_bot. You are the command interface for WRS-OS, a Federated Agent Marketplace. You help users manage organizations, browse agents, and deploy them. Be professional and technical." },
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
