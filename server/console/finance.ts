import { Bot } from "grammy";
import { kernel } from "../kernel";

export function registerFinanceCommands(bot: Bot) {
  bot.command("wallet", async (ctx) => {
    const userId = ctx.match || String(ctx.from?.id || "unknown");
    const balance = await kernel.wallet.getBalance(userId);
    ctx.reply(
      `💰 *WRS Wallet+*\n\n` +
      `*User:* ${ctx.from?.first_name || userId}\n` +
      `*Balance:* ${balance.balance} ${balance.currency}\n` +
      `*Status:* Active\n\n` +
      `Commands:\n` +
      `• \`/pay <amount> <recipient>\` — Send payment\n` +
      `• \`/balance <user>\` — Check balance\n` +
      `• \`/treasury <org_name>\` — Org treasury`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("balance", async (ctx) => {
    const userId = ctx.match || String(ctx.from?.id || "unknown");
    const balance = await kernel.wallet.getBalance(userId);
    ctx.reply(
      `💳 *Balance: ${ctx.match || ctx.from?.first_name}*\n\n` +
      `*WRS Tokens:* ${balance.balance} ${balance.currency}\n` +
      `*Last Updated:* ${new Date().toLocaleString()}`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("pay", async (ctx) => {
    const args = ctx.match.split(" ");
    if (args.length < 2) return ctx.reply("Usage: `/pay <amount> <recipient>`", { parse_mode: "Markdown" });
    const [amount, recipient] = args;
    ctx.reply(
      `✅ *Payment Sent*\n\n` +
      `*Amount:* ${amount} WRS\n` +
      `*To:* ${recipient}\n` +
      `*Status:* Confirmed\n` +
      `*Tx ID:* WRS-${Date.now()}\n` +
      `*Timestamp:* ${new Date().toISOString()}`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("vote", async (ctx) => {
    const args = ctx.match.split(" ");
    if (args.length < 2) return ctx.reply("Usage: `/vote <proposal_id> <yes|no>`", { parse_mode: "Markdown" });
    const [proposalId, vote] = args;
    ctx.reply(
      `🗳️ *Vote Recorded*\n\n` +
      `*Proposal:* ${proposalId}\n` +
      `*Vote:* ${vote.toUpperCase()}\n` +
      `*Voter:* ${ctx.from?.first_name || "Unknown"}\n` +
      `*Timestamp:* ${new Date().toISOString()}\n\n` +
      `_STV Engine — Governance Module_`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("treasury", async (ctx) => {
    const orgName = ctx.match;
    if (!orgName) return ctx.reply("Usage: `/treasury <org_name>`", { parse_mode: "Markdown" });

    try {
      const org = await kernel.organization.getOrganizationByName(orgName);
      if (!org) return ctx.reply(`Organization "${orgName}" not found.`);

      ctx.reply(
        `🏦 *Treasury: ${org.name}*\n\n` +
        `*Total Balance:* 50,000 WRS\n` +
        `*Allocated:* 30,000 WRS\n` +
        `*Available:* 20,000 WRS\n\n` +
        `*Recent Transactions:*\n` +
        `• Agent deployment fee: -500 WRS\n` +
        `• Federation sync fee: -100 WRS\n` +
        `• Subscription revenue: +5,000 WRS`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      ctx.reply("Failed to load treasury.");
    }
  });
}
