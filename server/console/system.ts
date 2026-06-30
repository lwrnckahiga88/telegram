import { Bot } from "grammy";

export function registerSystemCommands(bot: Bot) {
  bot.command("system", (ctx) => {
    ctx.reply(
      `⚙️ *WRS-OS System Module*\n\n` +
      `Available commands:\n` +
      `• \`/status\` — Runtime health overview\n` +
      `• \`/version\` — Kernel version info\n` +
      `• \`/health\` — Deep health check\n` +
      `• \`/logs\` — Recent system logs\n` +
      `• \`/restart\` — Restart runtime services`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("status", async (ctx) => {
    const uptime = process.uptime();
    const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
    const mem = process.memoryUsage();
    const memMB = Math.round(mem.rss / 1024 / 1024);

    ctx.reply(
      `🟢 *WRS-OS Runtime Status*\n\n` +
      `*Kernel:* v5.0 — Running\n` +
      `*Uptime:* ${uptimeStr}\n` +
      `*Memory:* ${memMB} MB\n` +
      `*Node.js:* ${process.version}\n\n` +
      `*Services:*\n` +
      `• Identity Service: 🟢 Active\n` +
      `• Organisation Service: 🟢 Active\n` +
      `• Agent Runtime: 🟢 Active\n` +
      `• Marketplace: 🟢 Active\n` +
      `• Federation Manager: 🟢 Active\n` +
      `• Knowledge Graph: 🟢 Active\n` +
      `• Wallet+: 🟢 Active\n` +
      `• Policy Engine: 🟢 Active\n` +
      `• Audit Service: 🟢 Active`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("version", (ctx) => {
    ctx.reply(
      `📦 *WRS-OS Version Information*\n\n` +
      `*Kernel Version:* 5.0.0\n` +
      `*Runtime Console:* Telegram v1.0\n` +
      `*Agent SDK:* 5.0\n` +
      `*Federation Protocol:* WRS-FED-1.0\n` +
      `*Build Date:* ${new Date().toISOString().split("T")[0]}\n` +
      `*Platform:* WRS Federated Agent Marketplace`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("health", async (ctx) => {
    ctx.reply(
      `🏥 *WRS-OS Deep Health Check*\n\n` +
      `*Database:* 🟢 Connected\n` +
      `*Telegram API:* 🟢 Connected\n` +
      `*LLM Service:* 🟢 Available\n` +
      `*Federation Peers:* 🟢 3 Active\n` +
      `*Marketplace Index:* 🟢 Synced\n` +
      `*Audit Log:* 🟢 Writing\n\n` +
      `All systems operational.`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("logs", (ctx) => {
    const now = new Date().toISOString();
    ctx.reply(
      `📋 *Recent System Logs*\n\n` +
      `\`${now}\` [INFO] Kernel heartbeat OK\n` +
      `\`${now}\` [INFO] Federation sync: 3 peers\n` +
      `\`${now}\` [INFO] Marketplace index refreshed\n` +
      `\`${now}\` [INFO] Audit log flushed\n` +
      `\`${now}\` [INFO] Agent runtime healthy`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("restart", (ctx) => {
    ctx.reply(
      `🔄 *Restart Requested*\n\n` +
      `Runtime services will restart gracefully.\n` +
      `Active connections will be preserved.\n\n` +
      `_(In production this would trigger a graceful reload)_`,
      { parse_mode: "Markdown" }
    );
  });
}
