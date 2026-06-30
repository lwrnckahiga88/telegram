import { wrsRuntime } from "./wrs-os";
import { ENV } from "./_core/env";

async function deploy() {
  console.log("Starting deployment process...");
  
  try {
    // 1. Ensure Marketplace is seeded
    await wrsRuntime.seedMarketplace();
    console.log("Marketplace seeded.");

    // 2. Ensure Organization exists
    let org = await wrsRuntime.getOrganizationByName("Lodwar Hospital");
    if (!org) {
      console.log("Creating organization: Lodwar Hospital...");
      const orgId = await wrsRuntime.createOrganization("Lodwar Hospital", "Hospital", 1);
      org = await wrsRuntime.getOrganizationByName("Lodwar Hospital");
    }
    
    if (!org) throw new Error("Failed to retrieve organization after creation");
    console.log(`Organization ready: ${org.name} (ID: ${org.id})`);

    // 3. Install Agent
    const agentsToInstall = ["bpu-t1-v5.0-nurse", "wrs-lab-ai-v1.0"];
    for (const agentUid of agentsToInstall) {
      console.log(`Installing agent: ${agentUid}...`);
      const agent = await wrsRuntime.installAgent(agentUid, org.id);
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
