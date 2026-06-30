import { db } from "./db";
import { organizations, agents, agentDeployments, organizationMembers, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export class WRSOSRuntime {
  // Organization Management
  async createOrganization(name: string, type: string, ownerId: number) {
    const [result] = await db.insert(organizations).values({
      name,
      type,
      ownerId,
    });
    
    const orgId = (result as any).insertId;
    
    // Automatically add owner as admin member
    await db.insert(organizationMembers).values({
      organizationId: orgId,
      userId: ownerId,
      role: 'admin',
    });
    
    return orgId;
  }

  async listOrganizations() {
    return await db.select().from(organizations);
  }

  async getOrganizationByName(name: string) {
    const results = await db.select().from(organizations).where(eq(organizations.name, name));
    return results[0];
  }

  // Agent Marketplace
  async listMarketplaceAgents() {
    return await db.select().from(agents).where(eq(agents.status, 'Published'));
  }

  async installAgent(agentUid: string, organizationId: number) {
    const agentResults = await db.select().from(agents).where(eq(agents.agentUid, agentUid));
    if (agentResults.length === 0) throw new Error("Agent not found");
    
    const agent = agentResults[0];
    
    await db.insert(agentDeployments).values({
      agentId: agent.id,
      organizationId,
      status: 'Running',
    });
    
    return agent;
  }

  // Seed initial marketplace data
  async seedMarketplace() {
    const initialAgents = [
      {
        agentUid: "bpu-t1-v5.0-nurse",
        name: "BPU-T1 Nurse",
        type: "Clinical",
        version: "5.0",
        description: "Specialized clinical agent for primary healthcare.",
        status: "Published" as const,
        isFederated: true,
      },
      {
        agentUid: "wrs-lab-ai-v1.0",
        name: "Lab AI",
        type: "Laboratory",
        version: "1.0",
        description: "AI agent for laboratory diagnostic support.",
        status: "Published" as const,
        isFederated: true,
      },
      {
        agentUid: "wrs-pharm-ai-v1.0",
        name: "Pharmacy AI",
        type: "Pharmacy",
        version: "1.0",
        description: "AI agent for pharmacy and medication management.",
        status: "Published" as const,
        isFederated: true,
      }
    ];

    for (const agentData of initialAgents) {
      const existing = await db.select().from(agents).where(eq(agents.agentUid, agentData.agentUid));
      if (existing.length === 0) {
        await db.insert(agents).values(agentData);
      }
    }
  }
}

export const wrsRuntime = new WRSOSRuntime();
