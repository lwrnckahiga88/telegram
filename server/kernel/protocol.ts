/**
 * WRS Runtime Protocol (WRP) v1.0
 * The universal participation protocol for any participant joining the world runtime.
 */
export interface WRSRuntimeProtocol {
  /**
   * Establish connection to a participant or resource.
   */
  connect(params: Record<string, any>): Promise<{ status: "connected" | "failed"; sessionId?: string }>;

  /**
   * Read state from a participant or resource.
   */
  read(query: string, options?: Record<string, any>): Promise<any>;

  /**
   * Write state or trigger actions on a participant or resource.
   */
  write(target: string, payload: any, options?: Record<string, any>): Promise<{ status: "success" | "error"; result?: any }>;

  /**
   * Check the health and availability of a participant or resource.
   */
  health(): Promise<{ status: "healthy" | "degraded" | "unhealthy"; details?: any }>;
}
