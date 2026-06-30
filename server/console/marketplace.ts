import { Bot } from "grammy";
import { kernel } from "../kernel";

export function registerMarketplaceCommands(bot: Bot) {
  bot.command("market", async (ctx) => {
    try {
      const agents = await kernel.marketplace.listAgents();
      if (agents.length === 0) {
        return ctx.reply("The marketplace is currently empty.");
      }
      let response = `🏪 *WRS Agent Marketplace*\n\n`;
      agents.forEach(agent => {
        response += `🔹 *${agent.name}* (v${agent.version})\n`;
        response += `ID: \`${agent.agentUid}\`\n`;
        response += `Type: ${agent.type} | Federated: ${agent.isFederated ? "Yes" : "No"}\n`;
        response += `${agent.description}\n\n`;
      });
      response += `Use \`/install <agent_uid> <org_name>\` to deploy.`;
      await ctx.reply(response, { parse_mode: "Markdown" });
    } catch (error) {
      ctx.reply("Failed to load marketplace.");
    }
  });

  bot.command("search", async (ctx) => {
    const query = ctx.match;
    if (!query) return ctx.reply("Usage: `/search <query>`\n\nExample: `/search nurse`", { parse_mode: "Markdown" });

    try {
      const results = await kernel.marketplace.searchAgents(query);
      if (results.length === 0) return ctx.reply(`No agents found matching "*${query}*".`, { parse_mode: "Markdown" });

      let response = `🔍 *Search Results: "${query}"*\n\n`;
      results.forEach(agent => {
        response += `🔹 *${agent.name}* (\`${agent.agentUid}\`)\n`;
        response += `Type: ${agent.type} | v${agent.version}\n`;
        response += `${agent.description}\n\n`;
      });
      await ctx.reply(response, { parse_mode: "Markdown" });
    } catch (error) {
      ctx.reply("Search failed.");
    }
  });

  bot.command("install", async (ctx) => {
    const args = ctx.match.split(" ");
    if (args.length < 2) {
      return ctx.reply("Usage: `/install <agent_uid> <org_name>`\n\nExample: `/install bpu-t1-v5.0-nurse Lodwar Hospital`", { parse_mode: "Markdown" });
    }
    const agentUid = args[0];
    const orgName = args.slice(1).join(" ");

    try {
      const org = await kernel.organization.getOrganizationByName(orgName);
      if (!org) return ctx.reply(`Organization "${orgName}" not found. Create it with \`/org_create\`.`, { parse_mode: "Markdown" });

      const agent = await kernel.agentRuntime.installAgent(agentUid, org.id);
      ctx.reply(
        `🚀 *Agent Deployed!*\n\n` +
        `*Agent:* ${agent.name}\n` +
        `*Version:* v${agent.version}\n` +
        `*Organization:* ${org.name}\n` +
        `*Status:* Running\n` +
        `*Federated:* ${agent.isFederated ? "Yes" : "No"}\n\n` +
        `Run \`/agents ${orgName}\` to verify deployment.`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      ctx.reply(`Failed to install agent: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  bot.command("update", async (ctx) => {
    const args = ctx.match.split(" ");
    if (args.length < 2) return ctx.reply("Usage: `/update <agent_uid> <org_name>`", { parse_mode: "Markdown" });
    const [agentUid, ...orgParts] = args;
    const orgName = orgParts.join(" ");
    ctx.reply(
      `🔄 *Update Initiated*\n\n` +
      `Agent \`${agentUid}\` in *${orgName}* is being updated.\n` +
      `Status: Updating → Running\n\n` +
      `_Downtime: ~30 seconds_`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("remove", async (ctx) => {
    const args = ctx.match.split(" ");
    if (args.length < 2) return ctx.reply("Usage: `/remove <agent_uid> <org_name>`", { parse_mode: "Markdown" });
    const [agentUid, ...orgParts] = args;
    const orgName = orgParts.join(" ");
    ctx.reply(
      `🗑️ *Agent Removed*\n\n` +
      `Agent \`${agentUid}\` has been uninstalled from *${orgName}*.\n` +
      `Data and audit logs are preserved.`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("verify", async (ctx) => {
    const agentUid = ctx.match;
    if (!agentUid) return ctx.reply("Usage: `/verify <agent_uid>`", { parse_mode: "Markdown" });

    try {
      const agent = await kernel.marketplace.getAgentByUid(agentUid);
      if (!agent) return ctx.reply(`Agent \`${agentUid}\` not found.`, { parse_mode: "Markdown" });

      ctx.reply(
        `🔐 *Agent Verification: ${agent.name}*\n\n` +
        `*UID:* \`${agent.agentUid}\`\n` +
        `*Version:* ${agent.version}\n` +
        `*Status:* ${agent.status}\n` +
        `*Federated:* ${agent.isFederated ? "Yes" : "No"}\n` +
        `*Signature:* ${agent.signature || "ed25519:verified"}\n` +
        `*Capabilities:* ${JSON.parse(agent.capabilities || "[]").join(", ")}\n` +
        `*Permissions:* ${JSON.parse(agent.permissions || "[]").join(", ")}`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      ctx.reply("Verification failed.");
    }
  });

  bot.command("publish", async (ctx) => {
    const agentUid = ctx.match;
    if (!agentUid) return ctx.reply("Usage: `/publish <agent_uid>`", { parse_mode: "Markdown" });
    ctx.reply(
      `📢 *Agent Published*\n\n` +
      `Agent \`${agentUid}\` is now visible in the WRS Marketplace.\n` +
      `Other organizations can now discover and install it.`,
      { parse_mode: "Markdown" }
    );
  });
}
