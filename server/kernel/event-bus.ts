/**
 * WRS Event Bus (Layer 3)
 * Everything in WRS ultimately flows through events.
 */
export class EventBus {
  private handlers: Map<string, ((payload: any) => void)[]> = new Map();

  /**
   * Publish an event to the bus.
   */
  public async publish(topic: string, payload: any) {
    console.log(`[EventBus] Publishing to ${topic}`);
    const topicHandlers = this.handlers.get(topic) || [];
    topicHandlers.forEach(handler => handler(payload));
  }

  /**
   * Subscribe to a topic.
   */
  public subscribe(topic: string, handler: (payload: any) => void) {
    const topicHandlers = this.handlers.get(topic) || [];
    topicHandlers.push(handler);
    this.handlers.set(topic, topicHandlers);
  }

  /**
   * Unsubscribe from a topic.
   */
  public unsubscribe(topic: string, handler: (payload: any) => void) {
    const topicHandlers = this.handlers.get(topic) || [];
    this.handlers.set(topic, topicHandlers.filter(h => h !== handler));
  }
}
