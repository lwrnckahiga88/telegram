import { getDb } from "./db";
import { organizations, agents, agentDeployments, users } from "../shared/types";
import { eq, and } from "drizzle-orm";

/**
 * Enterprise WRS-OS Runtime Kernel
 * Manages Organizations, Agents, Federation, and Marketplace
 */
export class WRSOSRuntime {
  
  // --- Organization Management ---

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

  // --- Agent Marketplace & Lifecycle ---

  async listMarketplaceAgents() {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(agents).where(eq(agents.status, 'Published'));
  }

  async searchAgents(query: string) {
    const all = await this.listMarketplaceAgents();
    return all.filter(a => 
      a.name.toLowerCase().includes(query.toLowerCase()) || 
      (a.type && a.type.toLowerCase().includes(query.toLowerCase()))
    );
  }

  async getAgentByUid(agentUid: string) {
    const db = await getDb();
    if (!db) return null;
    const results = await db.select().from(agents).where(eq(agents.agentUid, agentUid));
    return results[0] || null;
  }

  async installAgent(agentUid: string, organizationId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const agent = await this.getAgentByUid(agentUid);
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

  // --- Federation & Identity ---

  async getFederationStatus(organizationId: number) {
    const db = await getDb();
    if (!db) return null;

    const org = await db.select().from(organizations).where(eq(organizations.id, organizationId));
    if (!org[0]) return null;
    
    return {
      organisation: org[0].name,
      version: "5.0",
      country: org[0].country,
      status: "Active",
      peers: 3, 
      lastSync: new Date(),
    };
  }

  // --- Seeding ---

  async seedInitialData() {
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
        agentUid: "google-gemini-1.5-pro",
        name: "Google Gemini 1.5 Pro",
        type: "Multimodal AI",
        version: "1.5",
        description: "High-performance multimodal model with 2M token context window.",
        capabilities: JSON.stringify(["Large Context", "Multimodal", "Video Analysis"]),
        permissions: JSON.stringify(["internet.access", "storage.write"]),
        status: "Published" as const,
        isFederated: true,
      },
      {
        agentUid: "msft-taskmaster-v2",
        name: "TaskMaster Pro",
        type: "Utility",
        version: "2.0",
        description: "Enterprise-grade task management and scheduling agent.",
        capabilities: JSON.stringify(["Scheduling", "Project Management", "Outlook Integration"]),
        permissions: JSON.stringify(["calendar.read", "calendar.write"]),
        status: "Published" as const,
        isFederated: true,
      },
      {
        agentUid: "amazon-datacrawler-v1",
        name: "DataCrawler",
        type: "Data Extraction",
        version: "1.0",
        description: "High-speed web scraping and data extraction agent.",
        capabilities: JSON.stringify(["Scraping", "Data Extraction", "ETL"]),
        permissions: JSON.stringify(["internet.access"]),
        status: "Published" as const,
        isFederated: true,
      },
      {
        agentUid: "ibm-marketanalyst-v3",
        name: "MarketAnalyst",
        type: "Finance",
        version: "3.0",
        description: "Financial market analysis and forecasting powered by Watson.",
        capabilities: JSON.stringify(["Forecasting", "Sentiment Analysis", "Risk Assessment"]),
        permissions: JSON.stringify(["finance.data.read"]),
        status: "Published" as const,
        isFederated: true,
      },
      {
        agentUid: "deepmind-lab-v3",
        name: "DeepMind Lab",
        type: "Research",
        version: "3.0",
        description: "3D learning environment based on Quake III for navigation and memory research.",
        capabilities: JSON.stringify(["Navigation", "Visual Perception", "Memory"]),
        permissions: JSON.stringify(["gpu.compute"]),
        status: "Published" as const,
        isFederated: true,
      },
      {
        agentUid: "deepmind-control-v2",
        name: "DeepMind Control Suite",
        type: "Robotics",
        version: "2.0",
        description: "Standardized benchmarks for continuous control tasks in MuJoCo.",
        capabilities: JSON.stringify(["Physics Simulation", "Continuous Control", "Robotics"]),
        permissions: JSON.stringify(["gpu.compute"]),
        status: "Published" as const,
        isFederated: true,
      },
      {
        agentUid: "facebook-fair-chatbuddy",
        name: "ChatBuddy",
        type: "Conversational",
        version: "1.0",
        description: "Llama-powered conversational agent for general inquiries.",
        capabilities: JSON.stringify(["Conversation", "Question Answering"]),
        permissions: JSON.stringify(["chat.history.read"]),
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
      }
    ];

    for (const agentData of initialAgents) {
      const existing = await this.getAgentByUid(agentData.agentUid);
      if (!existing) {
        await db.insert(agents).values(agentData);
      }
    }
  }
}

export const wrsRuntime = new WRSOSRuntime();
