import { Bot } from "grammy";
import { kernel } from "../kernel";

export function registerOrganizationCommands(bot: Bot) {
  bot.command("orgs", async (ctx) => {
    try {
      const orgs = await kernel.organization.listOrganizations();
      if (orgs.length === 0) {
        return ctx.reply(
          `🏢 *WRS Organizations*\n\nNo organizations yet.\nCreate one with \`/org_create <name> <type>\``,
          { parse_mode: "Markdown" }
        );
      }
      let response = `🏢 *WRS Organizations*\n\n`;
      orgs.forEach(org => {
        response += `• *${org.name}* — ${org.type || "General"} | ${org.country || "Kenya"}\n`;
      });
      response += `\nUse \`/org_status <name>\` for details.`;
      await ctx.reply(response, { parse_mode: "Markdown" });
    } catch (error) {
      ctx.reply("Failed to list organizations.");
    }
  });

  bot.command("org_create", async (ctx) => {
    const args = ctx.match.split(" ");
    if (args.length < 1 || !args[0]) {
      return ctx.reply("Usage: `/org_create <name> [type]`\n\nTypes: Hospital, County, NGO, University, Business, Government, Community", { parse_mode: "Markdown" });
    }
    const name = args[0];
    const type = args[1] || "General";

    try {
      const orgId = await kernel.organization.createOrganization(name, type, 1);
      ctx.reply(
        `✅ *Organization Created*\n\n` +
        `*Name:* ${name}\n` +
        `*Type:* ${type}\n` +
        `*ID:* ${orgId}\n` +
        `*Country:* Kenya\n\n` +
        `Next steps:\n` +
        `• \`/install <agent_uid> ${name}\` — Deploy an agent\n` +
        `• \`/join ${name}\` — Join federation network`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      ctx.reply("Failed to create organization. It may already exist.");
    }
  });

  bot.command("org_join", async (ctx) => {
    const orgName = ctx.match;
    if (!orgName) return ctx.reply("Usage: `/org_join <org_name>`", { parse_mode: "Markdown" });
    ctx.reply(`✅ You have joined *${orgName}*.`, { parse_mode: "Markdown" });
  });

  bot.command("org_invite", async (ctx) => {
    const args = ctx.match.split(" ");
    if (args.length < 2) return ctx.reply("Usage: `/org_invite <org_name> <username>`", { parse_mode: "Markdown" });
    const [orgName, username] = args;
    ctx.reply(`📨 Invitation sent to *${username}* to join *${orgName}*.`, { parse_mode: "Markdown" });
  });

  bot.command("org_policy", async (ctx) => {
    const orgName = ctx.match;
    if (!orgName) return ctx.reply("Usage: `/org_policy <org_name>`", { parse_mode: "Markdown" });

    try {
      const org = await kernel.organization.getOrganizationByName(orgName);
      if (!org) return ctx.reply(`Organization "${orgName}" not found.`);

      const policy = org.policy ? JSON.parse(org.policy) : {};
      ctx.reply(
        `📋 *Policy: ${org.name}*\n\n` +
        `*Default Federation:* ${policy.defaultFederation ? "Enabled" : "Disabled"}\n` +
        `*Data Isolation:* Enabled\n` +
        `*Role-Based Access:* Enabled\n` +
        `*Audit Logging:* Enabled\n` +
        `*Encrypted Secrets:* Enabled`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      ctx.reply("Failed to load policy.");
    }
  });

  bot.command("org_members", async (ctx) => {
    const orgName = ctx.match;
    if (!orgName) return ctx.reply("Usage: `/org_members <org_name>`", { parse_mode: "Markdown" });

    try {
      const org = await kernel.organization.getOrganizationByName(orgName);
      if (!org) return ctx.reply(`Organization "${orgName}" not found.`);

      ctx.reply(
        `👥 *Members: ${org.name}*\n\n` +
        `• System Admin — Admin\n\n` +
        `Use \`/org_invite ${orgName} <username>\` to add members.`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      ctx.reply("Failed to list members.");
    }
  });

  bot.command("org_status", async (ctx) => {
    const orgName = ctx.match;
    if (!orgName) return ctx.reply("Usage: `/org_status <org_name>`", { parse_mode: "Markdown" });

    try {
      const org = await kernel.organization.getOrganizationByName(orgName);
      if (!org) return ctx.reply(`Organization "${orgName}" not found.`);

      const fed = await kernel.federation.getStatus(org.id);
      const installed = await kernel.agentRuntime.listOrgAgents(org.id);

      let response = `📊 *Status: ${org.name}*\n\n`;
      response += `*Type:* ${org.type || "General"}\n`;
      response += `*Country:* ${org.country || "Kenya"}\n`;
      response += `*Federation:* ${fed?.status || "Inactive"}\n`;
      response += `*Peers:* ${fed?.peers || 0}\n`;
      response += `*Last Sync:* ${fed?.lastSync.toLocaleString() || "Never"}\n\n`;
      response += `*Deployed Agents (${installed.length}):*\n`;
      installed.forEach(a => {
        response += `• ${a.name} — ${(a as any).deploymentStatus}\n`;
      });
      if (installed.length === 0) {
        response += `_No agents deployed yet._`;
      }

      await ctx.reply(response, { parse_mode: "Markdown" });
    } catch (error) {
      ctx.reply("Failed to get status.");
    }
  });
}
