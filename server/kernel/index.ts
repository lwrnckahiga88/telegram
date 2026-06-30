import { IdentityService } from "./identity";
import { OrganisationService } from "./organization";
import { AgentRuntime } from "./agent-runtime";
import { Marketplace } from "./marketplace";
import { FederationManager } from "./federation";
import { KnowledgeGraph } from "./knowledge";
import { StateStore } from "./state-store";
import { WalletPlus } from "./wallet";
import { PolicyEngine } from "./policy";

/**
 * WRS-OS Kernel
 * The heart of the World Runtime System.
 * It manages everything underneath and never talks directly to users.
 */
export class WRSKernel {
  public identity: IdentityService;
  public organization: OrganisationService;
  public agentRuntime: AgentRuntime;
  public marketplace: Marketplace;
  public federation: FederationManager;
  public knowledge: KnowledgeGraph;
  public stateStore: StateStore;
  public wallet: WalletPlus;
  public policy: PolicyEngine;

  constructor() {
    this.identity = new IdentityService();
    this.organization = new OrganisationService();
    this.agentRuntime = new AgentRuntime();
    this.marketplace = new Marketplace();
    this.federation = new FederationManager();
    this.knowledge = new KnowledgeGraph();
    this.stateStore = new StateStore();
    this.wallet = new WalletPlus();
    this.policy = new PolicyEngine();
  }

  // Example event processing mechanism
  async processEvent(event: { type: string; payload: any; source: string }) {
    console.log(`[Kernel] Processing event: ${event.type} from ${event.source}`);
    // Basic event bus logic would go here
    switch (event.type) {
      case "PATIENT_ADMITTED":
        await this.stateStore.updatePatientState(event.payload);
        // Run SSD, calculate STV, notify Nurse Agent, etc.
        break;
      default:
        break;
    }
  }
}

export const kernel = new WRSKernel();
