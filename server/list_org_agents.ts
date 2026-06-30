/**
 * WRS-OS List Org Agents Script
 * Lists all agents deployed in an organization.
 * Uses the WRS Kernel API.
 */
import { kernel } from "./kernel";
import { seedInitialData } from "./kernel/seeder";

async function listAgents() {
  try {
    await seedInitialData();
    const orgId = await kernel.organization.createOrganization("Lodwar Hospital", "Hospital", 1);
    await kernel.agentRuntime.installAgent("bpu-t1-v5.0-nurse", orgId);

    const agents = await kernel.agentRuntime.listOrgAgents(orgId);
    console.log(`--- AGENTS AT LODWAR HOSPITAL ---`);
    if (agents.length === 0) {
      console.log("No agents installed.");
    } else {
      agents.forEach((a: any) => {
        console.log(`- ${a.name} (${a.agentUid}) | Status: ${a.deploymentStatus} | v${a.version}`);
      });
    }
  } catch (error) {
    console.error("Failed to list agents:", error);
  }
}

listAgents();
