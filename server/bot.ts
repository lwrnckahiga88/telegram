import "dotenv/config";
import { Bot } from "grammy";
import { invokeLLM } from "./_core/llm";
import { ENV } from "./_core/env";
import { seedInitialData } from "./kernel/seeder";

// Runtime Console Modules
import { registerSystemCommands } from "./console/system";
import { registerFederationCommands } from "./console/federation";
import { registerOrganizationCommands } from "./console/organizations";
import { registerMarketplaceCommands } from "./console/marketplace";
import { registerAgentCommands } from "./console/agents";
import { registerClinicalCommands } from "./console/clinical";
import { registerFinanceCommands } from "./console/finance";
import { registerKnowledgeCommands } from "./console/knowledge";
import { registerConnectorCommands } from "./console/connectors";

// Configure LLM service
ENV.forgeApiKey = process.env.OPENAI_API_KEY || "";
ENV.forgeApiUrl = "https://api.manus.im/api/llm-proxy";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not configured in .env");
}

export const bot = new Bot(BOT_TOKEN);

// ─────────────────────────────────────────────────────────────────────────────
// WRS-OS RUNTIME CONSOLE
//
// Architecture:
//   Telegram → Bot (Console Adapter) → Kernel API → Services → Response
//
// The bot is a thin adapter. It receives commands, calls the Kernel,
// and displays results. It contains no business logic itself.
// ─────────────────────────────────────────────────────────────────────────────

// Middleware: Seed marketplace on first request
let seeded = false;
bot.use(async (ctx, next) => {
  if (!seeded) {
    try {
      await seedInitialData();
      seeded = true;
    } catch (_e) {
      // Silently continue if DB not available
    }
  }
  await next();
});

// /start — Welcome message
bot.command("start", (ctx) => {
  ctx.reply(
    `🌐 *WRS-OS Runtime Console*\n\n` +
    `Welcome, ${ctx.from?.first_name || "Operator"}.\n\n` +
    `You are connected to the *World Runtime System* — a Federated Agent Marketplace and Distributed Operating Environment.\n\n` +
    `*Runtime Console Modules:*\n` +
    `⚙️ \`/system\` — System & Health\n` +
    `🌐 \`/federation\` — Federation Network\n` +
    `🏢 \`/orgs\` — Organizations\n` +
    `🏪 \`/market\` — Agent Marketplace\n` +
    `🤖 \`/agents <org>\` — Agent Runtime\n` +
    `🏥 \`/patient <id>\` — Clinical Module\n` +
    `💰 \`/wallet\` — Finance & Wallet+\n` +
    `🧠 \`/graph <topic>\` — Knowledge Graph\n` +
    `🔌 \`/connectors\` — Connector Manager\n\n` +
    `Type \`/help\` for the full command reference.\n\n` +
    `_WRS-OS v5.0 — Kernel Active_`,
    { parse_mode: "Markdown" }
  );
});

// /help — Full command reference
bot.command("help", (ctx) => {
  ctx.reply(
    `📖 *WRS-OS Command Reference*\n\n` +

    `*System Module*\n` +
    `\`/system\` \`/status\` \`/version\` \`/health\` \`/logs\` \`/restart\`\n\n` +

    `*Federation Module*\n` +
    `\`/federation\` \`/fed_status <org>\` \`/peers <org>\` \`/sync <org>\`\n` +
    `\`/trust <org>\` \`/join <org>\` \`/leave <org>\`\n\n` +

    `*Organizations Module*\n` +
    `\`/orgs\` \`/org_create <name> [type]\` \`/org_join <org>\`\n` +
    `\`/org_invite <org> <user>\` \`/org_policy <org>\` \`/org_members <org>\` \`/org_status <org>\`\n\n` +

    `*Marketplace Module*\n` +
    `\`/market\` \`/search <query>\` \`/install <uid> <org>\` \`/update <uid> <org>\`\n` +
    `\`/remove <uid> <org>\` \`/verify <uid>\` \`/publish <uid>\`\n\n` +

    `*Agent Runtime Module*\n` +
    `\`/agents <org>\` \`/deploy <uid> <org>\` \`/stop <uid> <org>\` \`/upgrade <uid> <org>\`\n\n` +

    `*Clinical Module*\n` +
    `\`/patient <id>\` \`/lab <id>\` \`/ssd <id>\` \`/partograph <id>\` \`/who <id>\` \`/paed <id>\`\n\n` +

    `*Finance Module*\n` +
    `\`/wallet\` \`/balance <user>\` \`/pay <amount> <recipient>\` \`/vote <proposal> <yes|no>\` \`/treasury <org>\` \`/mpesa <amount> <phone>\`\n\n` +

    `*Knowledge Module*\n` +
    `\`/graph <topic>\` \`/discover <topic>\` \`/reason <question>\` \`/history <entity>\`\n\n` +

    `*Connector Module*\n` +
    `\`/connectors\` \`/connect <id>\` \`/disconnect <id>\` \`/test <id>\` \`/permissions <id>\`\n\n` +

    `_WRS-OS v5.0 — Federated Agent Marketplace_`,
    { parse_mode: "Markdown" }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Register all Runtime Console Modules
// ─────────────────────────────────────────────────────────────────────────────
registerSystemCommands(bot);
registerFederationCommands(bot);
registerOrganizationCommands(bot);
registerMarketplaceCommands(bot);
registerAgentCommands(bot);
registerClinicalCommands(bot);
registerFinanceCommands(bot);
registerKnowledgeCommands(bot);
registerConnectorCommands(bot);

// ─────────────────────────────────────────────────────────────────────────────
// AI Chat Handler — LLM-powered fallback for natural language queries
// The bot delegates to the Kernel LLM service and returns the response.
// ─────────────────────────────────────────────────────────────────────────────
bot.on("message:text", async (ctx) => {
  const userText = ctx.message.text;
  if (userText.startsWith("/")) return;

  try {
    await ctx.replyWithChatAction("typing");
    const result = await invokeLLM({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            `You are the WRS-OS Runtime Console — the command interface for the World Runtime System, ` +
            `a Federated Agent Marketplace and Distributed Operating Environment. ` +
            `You help operators manage organizations, browse and deploy agents, manage federation, ` +
            `and access clinical, finance, and knowledge modules. ` +
            `Be professional, concise, and technical. ` +
            `When users ask about commands, guide them to use the appropriate slash commands. ` +
            `WRS-OS v5.0 — Kernel Active.`
        },
        { role: "user", content: userText }
      ]
    });
    const responseText = result.choices[0].message.content;
    if (typeof responseText === "string") {
      await ctx.reply(responseText);
    } else {
      const text = (responseText as any[]).map((part: any) => part.type === "text" ? part.text : "").join("\n");
      await ctx.reply(text || "I received a non-text response.");
    }
  } catch (error) {
    console.error("[Bot] LLM error:", error);
    await ctx.reply("Sorry, I encountered an error. Please try again or use a slash command.");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Bot Startup
// ─────────────────────────────────────────────────────────────────────────────
export function startBot() {
  bot.start({
    onStart: (botInfo) => {
      console.log(`[WRS-OS] Runtime Console @${botInfo.username} is active.`);
      console.log(`[WRS-OS] Kernel v5.0 — All modules loaded.`);
    },
  });
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.endsWith("bot.ts")) {
  startBot();
}
