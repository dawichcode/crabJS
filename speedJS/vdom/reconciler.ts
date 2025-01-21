import { VNode } from './VNode';
import { Component } from './Component';
import { ErrorBoundary } from './ErrorBoundary';
import { BatchUpdate } from './BatchUpdate';
import { EventDelegator } from './events/EventDelegator';

export class Reconciler {
  private static instance: Reconciler;
  
  /**
   * Get singleton instance
   */
  public static getInstance(): Reconciler {
    if (!Reconciler.instance) {
      Reconciler.instance = new Reconciler();
    }
    return Reconciler.instance;
  }

  /**
   * Creates a real DOM element from a virtual node
   */
  public createDOMElement(vnode: VNode | string): HTMLElement | Text {
    if (typeof vnode === 'string') {
      return document.createTextNode(vnode);
    }

    if (typeof vnode.type === 'function') {
      return this.createComponent(vnode);
    }

    const element = document.createElement(vnode.type as string);
    
    // Set properties with batched event handlers
    Object.entries(vnode.props || {}).forEach(([name, value]) => {
      if (name === 'className') {
        element.setAttribute('class', String(value));
      } else if (name.startsWith('on')) {
        const eventName = name.toLowerCase().substring(2);
        if (typeof value === 'function') {
          element.addEventListener(
            eventName, 
            BatchUpdate.wrap(value as EventListener)
          );
        }
      } else {
        element.setAttribute(name, String(value));
      }
    });

    // Append children
    vnode.children.forEach(child => {
        //@ts-ignore
      const childElement = this.createDOMElement(child);
      element.appendChild(childElement);
    });

    return element;
  }

  /**
   * Creates a component instance with error boundary support
   */
  private createComponent(vnode: VNode): HTMLElement {
    try {
      const ComponentClass = vnode.type as new (props: any) => Component;
      const component = new ComponentClass(vnode.props);
      
      // Set error boundary if component is within one
      if (this.currentErrorBoundary) {
        component.setErrorBoundary(this.currentErrorBoundary);
      }
      
      // If component is an error boundary, set it as current
      if (component instanceof ErrorBoundary) {
        this.currentErrorBoundary = component;
      }
      
      const rendered = component.render();
      const element = this.createDOMElement(rendered) as HTMLElement;
      
      // Reset error boundary if we're done with this one
      if (component instanceof ErrorBoundary) {
        this.currentErrorBoundary = null;
      }
      
      return element;
    } catch (error) {
      if (this.currentErrorBoundary) {
        return this.handleErrorInBoundary(error as Error);
      }
      throw error;
    }
  }

  private currentErrorBoundary: ErrorBoundary | null = null;

  /**
   * Handles errors within error boundaries
   */
  private handleErrorInBoundary(error: Error): HTMLElement {
    if (this.currentErrorBoundary) {
      const state = ErrorBoundary.getDerivedStateFromError(error);
      this.currentErrorBoundary.setState(state);
      const fallback = this.currentErrorBoundary.render();
      return this.createDOMElement(fallback) as HTMLElement;
    }
    throw error;
  }

  /**
   * Updates an existing DOM node
   */
  public updateDOMElement(dom: HTMLElement, oldVNode: VNode, newVNode: VNode): void {
    if (oldVNode.type !== newVNode.type) {
      // Replace the node entirely if types are different
      const newElement = this.createDOMElement(newVNode);
      dom.parentNode?.replaceChild(newElement, dom);
      return;
    }

    // Update props
    this.updateProps(dom, oldVNode.props, newVNode.props);
    
    // Update children
    //@ts-ignore
    this.updateChildren(dom, oldVNode.children, newVNode.children);
  }

  /**
   * Updates props on a DOM element
   */
  private updateProps(dom: HTMLElement, oldProps: Record<string, any>, newProps: Record<string, any>): void {
    // Remove old props
    Object.keys(oldProps).forEach(name => {
      if (!(name in newProps)) {
        if (name.startsWith('on')) {
          const eventName = name.toLowerCase().substring(2);
          EventDelegator.getInstance().removeEventListener(dom, eventName);
        } else {
          dom.removeAttribute(name);
        }
      }
    });

    // Set new props
    Object.entries(newProps).forEach(([name, value]) => {
      if (oldProps[name] !== value) {
        if (name.startsWith('on')) {
          const eventName = name.toLowerCase().substring(2);
          EventDelegator.getInstance().addEventListener(
            dom,
            eventName,
            //@ts-ignore
            value as (event: Event) => void
          );
        } else {
          dom.setAttribute(name, value);
        }
      }
    });
  }

  /**
   * Updates children of a DOM element with key support
   */
  private updateChildren(
    dom: HTMLElement, 
    oldChildren: Array<VNode | string>, 
    newChildren: Array<VNode | string>
  ): void {
    const oldKeyedChildren = new Map<string | number, { node: VNode | string, index: number }>();
    const newKeyedChildren = new Map<string | number, { node: VNode | string, index: number }>();
    
    // First pass: collect keyed nodes
    oldChildren.forEach((child, i) => {
      if (typeof child !== 'string' && child.key != null) {
        oldKeyedChildren.set(child.key, { node: child, index: i });
      }
    });

    const resultChildren: Array<VNode | string> = [];
    let lastIndex = 0;

    // Second pass: process new children
    newChildren.forEach((newChild, newIndex) => {
      let oldChild: VNode | string | undefined;
      let oldIndex: number | undefined;

      // Handle keyed nodes
      if (typeof newChild !== 'string' && newChild.key != null) {
        const oldKeyedChild = oldKeyedChildren.get(newChild.key);
        if (oldKeyedChild) {
          oldChild = oldKeyedChild.node;
          oldIndex = oldKeyedChild.index;
        }
      } else {
        // Handle non-keyed nodes
        oldChild = oldChildren[newIndex];
        oldIndex = newIndex;
      }

      // Reuse or create DOM node
      if (oldChild) {
        if (oldIndex! < lastIndex) {
          // Move node
          dom.insertBefore(
            dom.childNodes[oldIndex!],
            dom.childNodes[newIndex]
          );
        } else {
          lastIndex = oldIndex!;
        }
        
        // Update node
        if (typeof oldChild !== 'string' && typeof newChild !== 'string') {
          this.updateDOMElement(
            dom.childNodes[newIndex] as HTMLElement,
            oldChild,
            newChild
          );
        }
      } else {
        // Insert new node
        const newElement = this.createDOMElement(newChild);
        if (newIndex < dom.childNodes.length) {
          dom.insertBefore(newElement, dom.childNodes[newIndex]);
        } else {
          dom.appendChild(newElement);
        }
      }

      resultChildren.push(newChild);
    });

    // Remove old nodes that aren't reused
    while (dom.childNodes.length > resultChildren.length) {
      dom.removeChild(dom.lastChild!);
    }
  }
} 