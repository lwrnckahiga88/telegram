/**
 * WRS-OS Deployment Script
 * Seeds the marketplace and deploys agents to an organization.
 * Uses the WRS Kernel API.
 */
import { kernel } from "./kernel";
import { seedInitialData } from "./kernel/seeder";

async function deploy() {
  console.log("Starting WRS-OS deployment process...");
  try {
    // 1. Seed marketplace
    await seedInitialData();
    console.log("Marketplace seeded.");

    // 2. Ensure organization exists
    let org = await kernel.organization.getOrganizationByName("Lodwar Hospital");
    if (!org) {
      console.log("Creating organization: Lodwar Hospital...");
      await kernel.organization.createOrganization("Lodwar Hospital", "Hospital", 1);
      org = await kernel.organization.getOrganizationByName("Lodwar Hospital");
    }
    if (!org) throw new Error("Failed to retrieve organization after creation");
    console.log(`Organization ready: ${org.name} (ID: ${org.id})`);

    // 3. Install agents
    const agentsToInstall = ["bpu-t1-v5.0-nurse", "wrs-lab-ai-v1.0"];
    for (const agentUid of agentsToInstall) {
      console.log(`Installing agent: ${agentUid}...`);
      const agent = await kernel.agentRuntime.installAgent(agentUid, org.id);
      console.log(`Agent ${agent.name} installed.`);
    }

    console.log("--- DEPLOYMENT SUCCESSFUL ---");
    console.log(`Organization: ${org.name}`);
    console.log(`Status: All agents running`);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

deploy();
