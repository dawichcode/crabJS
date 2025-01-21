import { Component } from './Component';
import { VNode } from './VNode';
import { setCurrentComponent } from './hooks';

export abstract class FunctionalComponent extends Component {
  private _hooks: any[] = [];

  render(): VNode {
    setCurrentComponent(this);
    const result = this.renderFunction();
    setCurrentComponent(null);
    return result;
  }

  abstract renderFunction(): VNode;
} 