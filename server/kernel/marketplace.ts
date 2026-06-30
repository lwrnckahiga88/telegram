import { getDb } from "../db";
import { agents } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export class Marketplace {
  async listAgents() {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(agents).where(eq(agents.status, 'Published'));
  }

  async searchAgents(query: string) {
    const all = await this.listAgents();
    return all.filter(a => 
      a.name.toLowerCase().includes(query.toLowerCase()) || 
      (a.type && a.type.toLowerCase().includes(query.toLowerCase())) ||
      (a.description && a.description.toLowerCase().includes(query.toLowerCase()))
    );
  }

  async getAgentByUid(agentUid: string) {
    const db = await getDb();
    if (!db) return null;
    const results = await db.select().from(agents).where(eq(agents.agentUid, agentUid));
    return results[0] || null;
  }
}
