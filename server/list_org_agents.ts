import { wrsRuntime } from "./wrs-os";

async function listAgents() {
  try {
    // 1. Setup mock data (since runtime resets in new script execution)
    const orgId = await wrsRuntime.createOrganization("Lodwar Hospital", "Hospital", 1);
    await wrsRuntime.installAgent("bpu-t1-v5.0-nurse", orgId);
    
    // 2. Query
    const agents = await wrsRuntime.listAgentsByOrganization(orgId);
    
    console.log(`--- AGENTS AT LODWAR HOSPITAL ---`);
    if (agents.length === 0) {
      console.log("No agents installed.");
    } else {
      agents.forEach(a => {
        console.log(`- ${a.name} (${a.agentUid}) | Status: ${a.deploymentStatus} | v${a.version}`);
      });
    }
  } catch (error) {
    console.error("Failed to list agents:", error);
  }
}

listAgents();
