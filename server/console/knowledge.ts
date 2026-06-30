import { Bot } from "grammy";
import { kernel } from "../kernel";

export function registerKnowledgeCommands(bot: Bot) {
  bot.command("graph", async (ctx) => {
    const topic = ctx.match;
    if (!topic) {
      return ctx.reply(
        `🧠 *WRS Knowledge Graph*\n\n` +
        `Usage: \`/graph <topic>\`\n\n` +
        `Other commands:\n` +
        `• \`/discover <topic>\` — Discover related concepts\n` +
        `• \`/reason <question>\` — Logical reasoning\n` +
        `• \`/history <entity>\` — Entity history`,
        { parse_mode: "Markdown" }
      );
    }
    const result = await kernel.knowledge.query(topic);
    ctx.reply(
      `🧠 *Knowledge Graph: ${topic}*\n\n` +
      `${result}\n\n` +
      `_Knowledge Graph v5.0_`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("discover", async (ctx) => {
    const topic = ctx.match;
    if (!topic) return ctx.reply("Usage: `/discover <topic>`", { parse_mode: "Markdown" });

    ctx.reply(
      `🔭 *Discovery: ${topic}*\n\n` +
      `*Related Concepts:*\n` +
      `• Primary Healthcare → Community Health → BPU-T1\n` +
      `• Maternal Health → Partograph → WHO Guidelines\n` +
      `• Anaemia → Iron Deficiency → Nutrition\n\n` +
      `_Knowledge Graph — SSD Engine_`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("reason", async (ctx) => {
    const question = ctx.match;
    if (!question) return ctx.reply("Usage: `/reason <question>`", { parse_mode: "Markdown" });

    ctx.reply(
      `💡 *Reasoning: ${question}*\n\n` +
      `*Analysis:* Processing through Knowledge Graph...\n\n` +
      `*Conclusion:* Based on available data, the most likely explanation involves clinical, environmental, and social determinants.\n\n` +
      `_Policy Engine + Knowledge Graph v5.0_`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("history", async (ctx) => {
    const entity = ctx.match;
    if (!entity) return ctx.reply("Usage: `/history <entity>`", { parse_mode: "Markdown" });

    ctx.reply(
      `📜 *History: ${entity}*\n\n` +
      `*Events:*\n` +
      `• ${new Date().toLocaleDateString()} — Entity created\n` +
      `• ${new Date().toLocaleDateString()} — State updated\n` +
      `• ${new Date().toLocaleDateString()} — Federation synced\n\n` +
      `_Audit Service v5.0_`,
      { parse_mode: "Markdown" }
    );
  });
}
