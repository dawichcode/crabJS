import { Component } from './Component';
import { VNode } from './VNode';

class ContextProvider<T> extends Component<{ value: T; children: VNode | VNode[] }, {}> {
  context: Context<T>;

  constructor(props: { value: T; children: VNode | VNode[] }, context: Context<T>) {
    super(props);
    this.context = context;
  }

  componentDidMount(): void {
    this.updateContextValue();
  }

  componentDidUpdate(): void {
    this.updateContextValue();
  }

  updateContextValue(): void {
    const oldValue = this.context.getValue();
    const newValue = this.props.value;

    if (oldValue !== newValue) {
      this.context.setValue(newValue);
    }
  }

  render(): VNode {
    return this.props.children as VNode;
  }
}

class ContextConsumer<T> extends Component<{ children: (value: T) => VNode }, {}> {
  context: Context<T>;
  unsubscribe: (() => void) | null = null;

  constructor(props: { children: (value: T) => VNode }, context: Context<T>) {
    super(props);
    this.context = context;
  }

  componentDidMount(): void {
    this.unsubscribe = this.context.subscribe(this);
  }

  componentWillUnmount(): void {
    this.unsubscribe?.();
  }

  render(): VNode {
    return this.props.children(this.context.getValue());
  }
}

export class Context<T> {
  private subscribers = new Set<Component>();
  private currentValue: T;

  constructor(defaultValue: T) {
    this.currentValue = defaultValue;
  }

  /**
   * Creates a new Context
   */
  static createContext<T>(defaultValue: T): Context<T> {
    return new Context<T>(defaultValue);
  }

  /**
   * Provider component that allows consuming components to subscribe to context changes
   */
  Provider = (props: { value: T; children: VNode | VNode[] }): VNode => {
    return new ContextProvider(props, this).render();
  };

  /**
   * Consumer component that subscribes to context changes
   */
  Consumer = (props: { children: (value: T) => VNode }): VNode => {
    return new ContextConsumer(props, this).render();
  };

  /**
   * Gets the current value of the context
   */
  getValue(): T {
    return this.currentValue;
  }

  /**
   * Sets the current value of the context
   */
  setValue(value: T): void {
    this.currentValue = value;
    this.notify();
  }

  /**
   * Subscribes a component to context changes
   */
  subscribe(component: Component): () => void {
    this.subscribers.add(component);
    return () => this.subscribers.delete(component);
  }

  /**
   * Notifies all subscribers of context changes
   */
  private notify(): void {
    this.subscribers.forEach(component => {
      component.forceUpdate();
    });
  }

  /**
   * Unsubscribes a component from context changes
   */
  unsubscribe(component: Component): void {
    this.subscribers.delete(component);
  }
}

/**
 * Hook to use context in functional components
 */
export function useContext<T>(context: Context<T>): T {
  return context.getValue();
} 