import { getDb } from "../db";
import { agents, agentDeployments } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { Marketplace } from "./marketplace";

export class AgentRuntime {
  private marketplace: Marketplace;
  
  constructor() {
    this.marketplace = new Marketplace();
  }

  async installAgent(agentUid: string, organizationId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const agent = await this.marketplace.getAgentByUid(agentUid);
    if (!agent) throw new Error(`Agent ${agentUid} not found`);
    
    const existing = await db.select().from(agentDeployments).where(
      and(
        eq(agentDeployments.agentId, agent.id),
        eq(agentDeployments.organizationId, organizationId)
      )
    );
    
    if (existing.length > 0) {
      return agent;
    }
    
    await db.insert(agentDeployments).values({
      agentId: agent.id,
      organizationId,
      status: 'Running',
      lastSync: new Date(),
    });
    
    return agent;
  }

  async listOrgAgents(organizationId: number) {
    const db = await getDb();
    if (!db) return [];
    
    const deployments = await db.select().from(agentDeployments).where(eq(agentDeployments.organizationId, organizationId));
    const agentIds = deployments.map(d => d.agentId);
    
    if (agentIds.length === 0) return [];
    
    const allAgents = await db.select().from(agents);
    return allAgents.filter(a => agentIds.includes(a.id)).map(a => {
      const dep = deployments.find(d => d.agentId === a.id);
      return { ...a, deploymentStatus: dep?.status, installedAt: dep?.installedAt };
    });
  }
  
  async updateAgentStatus(agentId: number, orgId: number, status: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    await db.update(agentDeployments)
      .set({ status })
      .where(and(eq(agentDeployments.agentId, agentId), eq(agentDeployments.organizationId, orgId)));
  }
}
