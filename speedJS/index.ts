import { Component } from './vdom/Component';

// Re-export everything needed from vdom
export { 
  createElement, 
  Component, 
  VNode,
  jsx,
  Fragment 
} from './vdom';

// Export SpeedJS main class
export class SpeedJS {
  private static instance: SpeedJS;

  private constructor() {}

  public static getInstance(): SpeedJS {
    if (!SpeedJS.instance) {
      SpeedJS.instance = new SpeedJS();
    }
    return SpeedJS.instance;
  }

  public mount(component: Component, selector: string): void {
    const container = document.querySelector(selector);
    if (!container) {
      throw new Error(`Target container ${selector} not found`);
    }
    component.mount(container as HTMLElement);
  }
}

// Create global instance
export const speed$ = SpeedJS.getInstance();

// Main entry point
export function main() {
  // Initialize any global configurations here
  if (typeof window !== 'undefined') {
    (window as any).speed$ = speed$;
  }
  return speed$;
}

// Auto-initialize when loaded as a module
if (typeof window !== 'undefined') {
  main();
} 