import { getDb } from "../db";
import { users, agents } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function seedInitialData() {
  const db = await getDb();
  if (!db) return;

  // Check if we have a default user
  let userList = await db.select().from(users);
  let user = userList[0];
  
  if (!user) {
    const [res] = await db.insert(users).values({
      openId: "system-default",
      name: "System Admin",
      role: "admin",
    });
    user = { id: res.insertId } as any;
  }

  const initialAgents = [
    {
      agentUid: "openai-gpt4-o",
      name: "OpenAI GPT-4o",
      type: "General AI",
      version: "1.0",
      description: "Omni model for reasoning, vision, and real-time interaction.",
      capabilities: JSON.stringify(["Reasoning", "Vision", "Voice", "Coding"]),
      permissions: JSON.stringify(["internet.access", "file.read"]),
      status: "Published" as const,
      isFederated: true,
    },
    {
      agentUid: "bpu-t1-v5.0-nurse",
      name: "BPU-T1 Nurse",
      type: "Clinical",
      version: "5.0",
      description: "Specialized clinical agent for primary healthcare in remote areas.",
      capabilities: JSON.stringify(["Diagnosis Support", "Patient Monitoring", "Health Education"]),
      permissions: JSON.stringify(["patient.records.read", "patient.records.write"]),
      status: "Published" as const,
      isFederated: true,
    },
    {
      agentUid: "wrs-lab-ai-v1.0",
      name: "Lab AI",
      type: "Laboratory",
      version: "1.0",
      description: "Automated laboratory result analysis and anomaly detection.",
      capabilities: JSON.stringify(["Result Analysis", "Anomaly Detection"]),
      permissions: JSON.stringify(["lab.records.read"]),
      status: "Published" as const,
      isFederated: true,
    },
    {
      agentUid: "wrs-pharmacy-ai-v2.1",
      name: "Pharmacy AI",
      type: "Pharmacy",
      version: "2.1",
      description: "Inventory management and drug interaction checker.",
      capabilities: JSON.stringify(["Inventory", "Interaction Check"]),
      permissions: JSON.stringify(["pharmacy.inventory.read", "pharmacy.inventory.write"]),
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
}
