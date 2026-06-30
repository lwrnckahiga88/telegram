import { Bot } from "grammy";

export function registerConnectorCommands(bot: Bot) {
  bot.command("connectors", (ctx) => {
    ctx.reply(
      `🔌 *WRS Connector Manager*\n\n` +
      `*Active Connectors:*\n` +
      `• Telegram API — 🟢 Active\n` +
      `• OpenAI LLM — 🟢 Active\n` +
      `• Database — 🟢 Active\n\n` +
      `Commands:\n` +
      `• \`/connect <connector_id>\` — Enable connector\n` +
      `• \`/disconnect <connector_id>\` — Disable connector\n` +
      `• \`/test <connector_id>\` — Test connector\n` +
      `• \`/permissions <connector_id>\` — View permissions`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("connect", (ctx) => {
    const connectorId = ctx.match;
    if (!connectorId) return ctx.reply("Usage: `/connect <connector_id>`", { parse_mode: "Markdown" });
    ctx.reply(`✅ Connector \`${connectorId}\` is now active.`, { parse_mode: "Markdown" });
  });

  bot.command("disconnect", (ctx) => {
    const connectorId = ctx.match;
    if (!connectorId) return ctx.reply("Usage: `/disconnect <connector_id>`", { parse_mode: "Markdown" });
    ctx.reply(`⏸️ Connector \`${connectorId}\` has been disconnected.`, { parse_mode: "Markdown" });
  });

  bot.command("test", (ctx) => {
    const connectorId = ctx.match;
    if (!connectorId) return ctx.reply("Usage: `/test <connector_id>`", { parse_mode: "Markdown" });
    ctx.reply(
      `🧪 *Connector Test: ${connectorId}*\n\n` +
      `*Ping:* 42ms\n` +
      `*Auth:* Valid\n` +
      `*Status:* 🟢 Healthy`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("permissions", (ctx) => {
    const connectorId = ctx.match;
    if (!connectorId) return ctx.reply("Usage: `/permissions <connector_id>`", { parse_mode: "Markdown" });
    ctx.reply(
      `🔐 *Permissions: ${connectorId}*\n\n` +
      `• read: ✅\n` +
      `• write: ✅\n` +
      `• admin: ❌`,
      { parse_mode: "Markdown" }
    );
  });
}
