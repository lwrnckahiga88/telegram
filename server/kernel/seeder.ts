import { getDb } from "../db";
import { users, agents, organizations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * WRS-OS Seeder
 * Initializes the kernel with bootstrap state as per WRS-OS v1.0.
 */
export async function seedInitialData() {
  const db = await getDb();
  if (!db) return;

  console.log("[Seeder] Bootstrapping WRS-OS state...");

  // 1. Ensure System Organization exists
  const existingSystemOrg = await db.select().from(organizations).where(eq(organizations.name, "System")).limit(1);
  if (existingSystemOrg.length === 0) {
    await db.insert(organizations).values({
      name: "System",
      type: "Kernel",
      country: "Global",
    });
  }

  // 2. Ensure Administrator exists
  const existingAdmin = await db.select().from(users).where(eq(users.openId, "root")).limit(1);
  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      openId: "root",
      name: "Administrator",
      role: "admin"
    });
  }

  // 3. Seed Marketplace with Core Agents and Adapters
  const initialAgents = [
    {
      agentUid: "bpu-t1-v5.0-nurse",
      name: "Clinical Nurse Agent",
      type: "Clinical",
      version: "5.0",
      description: "BPU-T1 Nurse for patient intake, triage, and health guidance.",
      capabilities: JSON.stringify(["Triage", "Intake", "Assessment"]),
      permissions: JSON.stringify(["patient.records.read", "patient.records.write"]),
      status: "Published" as const,
      isFederated: true,
    },
    {
      agentUid: "wrs-lab-ai-v1.0",
      name: "Laboratory Agent",
      type: "Clinical",
      version: "1.0",
      description: "AI Laboratory agent for processing results and health data.",
      capabilities: JSON.stringify(["Lab Analysis", "Anomaly Detection"]),
      permissions: JSON.stringify(["lab.records.read"]),
      status: "Published" as const,
      isFederated: true,
    },
    {
      agentUid: "openmrs-adapter-v1.0",
      name: "OpenMRS Adapter",
      type: "Adapter",
      version: "1.0",
      description: "Universal adapter for connecting to OpenMRS instances.",
      capabilities: JSON.stringify(["FHIR", "OpenMRS", "Read", "Write"]),
      permissions: JSON.stringify(["external.api.access"]),
      status: "Published" as const,
      isFederated: true,
    },
    {
      agentUid: "fhir-adapter-v1.0",
      name: "FHIR Adapter",
      type: "Adapter",
      version: "1.0",
      description: "Universal FHIR adapter for health data interoperability.",
      capabilities: JSON.stringify(["FHIR", "Interoperability"]),
      permissions: JSON.stringify(["external.api.access"]),
      status: "Published" as const,
      isFederated: true,
    },
    {
      agentUid: "ifmis-adapter-v1.0",
      name: "IFMIS Adapter",
      type: "Adapter",
      version: "1.0",
      description: "Universal adapter for connecting to IFMIS financial systems.",
      capabilities: JSON.stringify(["Finance", "Audit", "Reporting"]),
      permissions: JSON.stringify(["finance.api.access"]),
      status: "Published" as const,
      isFederated: true,
    }
  ];

  for (const agentData of initialAgents) {
    const results = await db.select().from(agents).where(eq(agents.agentUid, agentData.agentUid));
    if (results.length === 0) {
      await db.insert(agents).values(agentData);
    }
  }

  console.log("[Seeder] WRS-OS Bootstrap complete.");
}
