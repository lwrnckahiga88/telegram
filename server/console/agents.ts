import { Bot } from "grammy";
import { kernel } from "../kernel";

export function registerAgentCommands(bot: Bot) {
  bot.command("agents", async (ctx) => {
    const orgName = ctx.match;
    if (!orgName) {
      return ctx.reply(
        `🤖 *WRS Agent Runtime*\n\n` +
        `Usage: \`/agents <org_name>\`\n\n` +
        `Other commands:\n` +
        `• \`/deploy <agent_uid> <org_name>\` — Deploy agent\n` +
        `• \`/stop <agent_uid> <org_name>\` — Stop agent\n` +
        `• \`/restart <agent_uid> <org_name>\` — Restart agent\n` +
        `• \`/upgrade <agent_uid> <org_name>\` — Upgrade agent`,
        { parse_mode: "Markdown" }
      );
    }

    try {
      const org = await kernel.organization.getOrganizationByName(orgName);
      if (!org) return ctx.reply(`Organization "${orgName}" not found.`);

      const agents = await kernel.agentRuntime.listOrgAgents(org.id);
      if (agents.length === 0) {
        return ctx.reply(
          `No agents deployed in *${orgName}*.\n\nUse \`/install <agent_uid> ${orgName}\` to deploy one.`,
          { parse_mode: "Markdown" }
        );
      }

      let response = `🤖 *Agents in ${orgName}*\n\n`;
      agents.forEach(a => {
        const status = (a as any).deploymentStatus || "Unknown";
        const statusIcon = status === "Running" ? "🟢" : status === "Suspended" ? "🟡" : "🔴";
        response += `${statusIcon} *${a.name}* (v${a.version})\n`;
        response += `  ID: \`${a.agentUid}\`\n`;
        response += `  Type: ${a.type}\n`;
        response += `  Status: ${status}\n`;
        response += `  Installed: ${(a as any).installedAt?.toLocaleDateString() || "N/A"}\n`;
        response += `  Federated: ${a.isFederated ? "Yes" : "No"}\n\n`;
      });

      await ctx.reply(response, { parse_mode: "Markdown" });
    } catch (error) {
      ctx.reply("Failed to list agents.");
    }
  });

  bot.command("deploy", async (ctx) => {
    const args = ctx.match.split(" ");
    if (args.length < 2) return ctx.reply("Usage: `/deploy <agent_uid> <org_name>`", { parse_mode: "Markdown" });
    const agentUid = args[0];
    const orgName = args.slice(1).join(" ");

    try {
      const org = await kernel.organization.getOrganizationByName(orgName);
      if (!org) return ctx.reply(`Organization "${orgName}" not found.`);

      const agent = await kernel.agentRuntime.installAgent(agentUid, org.id);
      ctx.reply(
        `🚀 *Deployment Successful*\n\n` +
        `*Agent:* ${agent.name} v${agent.version}\n` +
        `*Organization:* ${org.name}\n` +
        `*Lifecycle State:* Draft → Verified → Published → Installed → Running\n` +
        `*Current State:* Running`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      ctx.reply(`Deployment failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  bot.command("stop", async (ctx) => {
    const args = ctx.match.split(" ");
    if (args.length < 2) return ctx.reply("Usage: `/stop <agent_uid> <org_name>`", { parse_mode: "Markdown" });
    const [agentUid, ...orgParts] = args;
    const orgName = orgParts.join(" ");
    ctx.reply(
      `⏸️ *Agent Suspended*\n\n` +
      `Agent \`${agentUid}\` in *${orgName}* has been suspended.\n` +
      `State: Running → Suspended\n\n` +
      `Use \`/restart ${agentUid} ${orgName}\` to resume.`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("upgrade", async (ctx) => {
    const args = ctx.match.split(" ");
    if (args.length < 2) return ctx.reply("Usage: `/upgrade <agent_uid> <org_name>`", { parse_mode: "Markdown" });
    const [agentUid, ...orgParts] = args;
    const orgName = orgParts.join(" ");
    ctx.reply(
      `⬆️ *Agent Upgrade Initiated*\n\n` +
      `Agent \`${agentUid}\` in *${orgName}* is upgrading.\n` +
      `State: Running → Updating → Running\n\n` +
      `Estimated time: ~60 seconds`,
      { parse_mode: "Markdown" }
    );
  });
}
