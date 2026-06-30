// Mocked WRS-OS Runtime to work without a live database in the sandbox environment
export class WRSOSRuntime {
  private orgs: any[] = [];
  private agentsList: any[] = [];
  private deployments: any[] = [];

  constructor() {
    this.seedMarketplace();
  }

  // Organization Management
  async createOrganization(name: string, type: string, ownerId: number) {
    const existing = this.orgs.find(o => o.name === name);
    if (existing) return existing.id;

    const newOrg = {
      id: this.orgs.length + 1,
      name,
      type,
      country: "Kenya",
      ownerId,
      createdAt: new Date(),
    };
    this.orgs.push(newOrg);
    return newOrg.id;
  }

  async listOrganizations() {
    return this.orgs;
  }

  async getOrganizationByName(name: string) {
    return this.orgs.find(o => o.name === name) || null;
  }

  async listAgentsByOrganization(organizationId: number) {
    const orgDeployments = this.deployments.filter(d => d.organizationId === organizationId);
    return orgDeployments.map(d => {
      const agent = this.agentsList.find(a => a.id === d.agentId);
      return { ...agent, deploymentStatus: d.status, installedAt: d.installedAt };
    });
  }

  // Agent Marketplace
  async listMarketplaceAgents() {
    return this.agentsList.filter(a => a.status === 'Published');
  }

  async installAgent(agentUid: string, organizationId: number) {
    const agent = this.agentsList.find(a => a.agentUid === agentUid);
    if (!agent) throw new Error("Agent not found");
    
    const deployment = {
      id: this.deployments.length + 1,
      agentId: agent.id,
      organizationId,
      status: 'Running',
      installedAt: new Date(),
    };
    this.deployments.push(deployment);
    return agent;
  }

  // Seed initial marketplace data
  async seedMarketplace() {
    const initialAgents = [
      {
        id: 1,
        agentUid: "bpu-t1-v5.0-nurse",
        name: "BPU-T1 Nurse",
        type: "Clinical",
        version: "5.0",
        description: "Specialized clinical agent for primary healthcare.",
        status: "Published",
        isFederated: true,
      },
      {
        id: 2,
        agentUid: "wrs-lab-ai-v1.0",
        name: "Lab AI",
        type: "Laboratory",
        version: "1.0",
        description: "AI agent for laboratory diagnostic support.",
        status: "Published",
        isFederated: true,
      },
      {
        id: 3,
        agentUid: "wrs-pharm-ai-v1.0",
        name: "Pharmacy AI",
        type: "Pharmacy",
        version: "1.0",
        description: "AI agent for pharmacy and medication management.",
        status: "Published",
        isFederated: true,
      }
    ];

    for (const agentData of initialAgents) {
      if (!this.agentsList.find(a => a.agentUid === agentData.agentUid)) {
        this.agentsList.push(agentData);
      }
    }
  }
}

export const wrsRuntime = new WRSOSRuntime();
