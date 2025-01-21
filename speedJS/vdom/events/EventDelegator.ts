import { BaseSyntheticEvent, SyntheticEvent } from './SyntheticEvent';
import { BatchUpdate } from '../BatchUpdate';

type EventHandler = (event: SyntheticEvent) => void;

export class EventDelegator {
  private static instance: EventDelegator;
  private eventHandlers: Map<string, Map<Element, EventHandler>> = new Map();
  private delegatedEvents: Set<string> = new Set();

  public static getInstance(): EventDelegator {
    if (!EventDelegator.instance) {
      EventDelegator.instance = new EventDelegator();
    }
    return EventDelegator.instance;
  }

  /**
   * Adds an event listener with delegation
   */
  public addEventListener(
    element: Element,
    eventType: string,
    handler: EventHandler
  ): void {
    // Setup delegation for this event type if not already done
    if (!this.delegatedEvents.has(eventType)) {
      document.addEventListener(eventType, this.handleEvent);
      this.delegatedEvents.add(eventType);
    }

    // Store the handler
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Map());
    }
    this.eventHandlers.get(eventType)!.set(element, handler);
  }

  /**
   * Removes an event listener
   */
  public removeEventListener(
    element: Element,
    eventType: string
  ): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(element);
    }
  }

  /**
   * Handles delegated events
   */
  private handleEvent = (nativeEvent: Event): void => {
    const path = nativeEvent.composedPath();
    const handlers = this.eventHandlers.get(nativeEvent.type);

    if (!handlers) return;

    // Find matching handlers along event path
    for (const element of path) {
      if (!(element instanceof Element)) continue;

      const handler = handlers.get(element);
      if (handler) {
        const syntheticEvent = new BaseSyntheticEvent(nativeEvent, element);
        
        // Wrap handler in batch update
        BatchUpdate.wrap(() => {
          handler(syntheticEvent);
        })();

        if (syntheticEvent.isPropagationStopped()) {
          break;
        }
      }
    }
  };
} 