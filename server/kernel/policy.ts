export class PolicyEngine {
  async evaluate(action: string, subject: string, resource: string) {
    return true; // Allow by default for now
  }
}
