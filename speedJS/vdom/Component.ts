import { VNode } from './VNode';
import { Reconciler } from './reconciler';
import { ErrorBoundary } from './ErrorBoundary';
import { Context } from './Context';
import { BatchUpdate } from './BatchUpdate';

export abstract class Component<P = any, S = any> {
  protected props: P;
  protected state: S;
  private domElement: HTMLElement | null = null;
  private prevVNode: VNode | null = null;
  private isMounted: boolean = false;
  private errorBoundary: ErrorBoundary | null = null;
  private contexts: Set<Context<any>> = new Set();
  
  constructor(props: P) {
    this.props = props;
    this.state = {} as S;
  }

  /**
   * Sets state and triggers re-render with batch support
   */
  public setState(newState: Partial<S>, callback?: () => void): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };

    BatchUpdate.getInstance().scheduleUpdate(() => {
      if (this.shouldComponentUpdate?.(this.props, this.state) !== false) {
        this.updateComponent(prevState);
      }
      callback?.();
    });
  }

  /**
   * Lifecycle method: Called before component updates
   */
  protected componentWillUpdate?(nextProps: P, nextState: S): void;

  /**
   * Lifecycle method: Called after component updates
   */
  protected componentDidUpdate?(prevProps: P, prevState: S): void;

  /**
   * Lifecycle method: Called after component mounts
   */
  protected componentDidMount?(): void;

  /**
   * Lifecycle method: Called before component unmounts
   */
  protected componentWillUnmount?(): void;

  /**
   * Lifecycle method: Determines if component should update
   */
  protected shouldComponentUpdate?(nextProps: P, nextState: S): boolean {
    return true;
  }

  /**
   * Abstract method that must be implemented by components
   */
  abstract render(): VNode;

  /**
   * Mounts component to DOM
   */
  public mount(container: HTMLElement): void {
    const vnode = this.render();
    this.prevVNode = vnode;
    this.domElement = Reconciler.getInstance().createDOMElement(vnode) as HTMLElement;
    container.appendChild(this.domElement);
    
    this.isMounted = true;
    this.componentDidMount?.();
  }

  /**
   * Unmounts component from DOM
   */
  public unmount(): void {
    if (this.domElement && this.isMounted) {
      this.componentWillUnmount?.();
      this.unsubscribeFromContexts();
      this.domElement.parentElement?.removeChild(this.domElement);
      this.isMounted = false;
      this.domElement = null;
      this.prevVNode = null;
    }
  }

  /**
   * Sets the error boundary for this component
   */
  setErrorBoundary(boundary: ErrorBoundary): void {
    this.errorBoundary = boundary;
  }

  /**
   * Handles errors that occur during rendering
   */
  protected handleError(error: Error): void {
    if (this.errorBoundary) {
      this.errorBoundary.handleError(error);
    } else {
      throw error;
    }
  }

  /**
   * Updates component with error handling
   */
  private updateComponent(prevState: S): void {
    if (this.domElement && this.prevVNode && this.isMounted) {
      try {
        const prevProps = { ...this.props };
        this.componentWillUpdate?.(this.props, this.state);
        
        const newVNode = this.render();
        Reconciler.getInstance().updateDOMElement(
          this.domElement,
          this.prevVNode,
          newVNode
        );
        
        this.prevVNode = newVNode;
        this.componentDidUpdate?.(prevProps, prevState);
      } catch (error) {
        this.handleError(error as Error);
      }
    }
  }

  /**
   * Force update component with batch support
   */
  public forceUpdate(callback?: () => void): void {
    if (this.isMounted) {
      BatchUpdate.getInstance().scheduleUpdate(() => {
        this.updateComponent(this.state);
        callback?.();
      });
    }
  }

  /**
   * Subscribes to a context
   */
  protected subscribeToContext<T>(context: Context<T>): T {
    this.contexts.add(context);
    return context.getValue();
  }

  /**
   * Unsubscribes from all contexts when unmounting
   */
  private unsubscribeFromContexts(): void {
    this.contexts.forEach(context => {
      context.unsubscribe(this);
    });
    this.contexts.clear();
  }
} 