import { IdentityService } from "./identity";
import { OrganisationService } from "./organization";
import { Marketplace } from "./marketplace";
import { AgentRuntime } from "./agent-runtime";
import { FederationManager } from "./federation";
import { KnowledgeGraph } from "./knowledge";
import { StateStore } from "./state-store";
import { WalletPlus } from "./wallet";
import { PolicyEngine } from "./policy";
import { EventBus } from "./event-bus";

/**
 * WRS Kernel API v1.0
 * The concrete implementation of the WRS-OS Enterprise Architecture.
 * Organized into six core domains as per the WRS-OS specification.
 */
export class WRSKernel {
  // 1. Runtime Domain (Layer 3 - Event Bus, Policy, Federation)
  public events: EventBus;
  public policy: PolicyEngine;
  public federation: FederationManager;
  
  // 2. Organization Domain (Layer 4)
  public organization: OrganisationService;
  
  // 3. Marketplace Domain (Layer 4)
  public marketplace: Marketplace;
  
  // 4. Runtime Lifecycle Domain (Layer 4)
  public agentRuntime: AgentRuntime;
  
  // 5. Identity Domain (Layer 4)
  public identity: IdentityService;

  // 6. Extended Services (Layer 4)
  public knowledge: KnowledgeGraph;
  public stateStore: StateStore;
  public wallet: WalletPlus;

  constructor() {
    this.events = new EventBus();
    this.policy = new PolicyEngine();
    this.federation = new FederationManager();
    this.organization = new OrganisationService();
    this.marketplace = new Marketplace();
    this.agentRuntime = new AgentRuntime();
    this.identity = new IdentityService();
    this.knowledge = new KnowledgeGraph();
    this.stateStore = new StateStore();
    this.wallet = new WalletPlus();
  }

  /**
   * Bootstrap the kernel with initial system state.
   */
  public async bootstrap() {
    console.log("[Kernel] Bootstrapping system state...");
    // Logic to ensure System Org, Core Agents, and Default Policies exist
  }
}

export const kernel = new WRSKernel();
