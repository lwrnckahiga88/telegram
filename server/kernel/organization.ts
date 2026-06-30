import { getDb } from "../db";
import { organizations, organizationMembers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export class OrganisationService {
  async createOrganization(name: string, type: string, ownerId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(organizations).values({
      name,
      type,
      ownerId,
      country: "Kenya",
      policy: JSON.stringify({ defaultFederation: true }),
    });
    
    // Add owner as admin member
    await db.insert(organizationMembers).values({
      organizationId: result.insertId,
      userId: ownerId,
      role: "admin"
    });
    
    return result.insertId;
  }

  async listOrganizations() {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(organizations);
  }

  async getOrganizationByName(name: string) {
    const db = await getDb();
    if (!db) return null;
    const results = await db.select().from(organizations).where(eq(organizations.name, name));
    return results[0] || null;
  }
  
  async getOrganizationById(id: number) {
    const db = await getDb();
    if (!db) return null;
    const results = await db.select().from(organizations).where(eq(organizations.id, id));
    return results[0] || null;
  }
}
