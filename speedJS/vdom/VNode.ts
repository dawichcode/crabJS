/**
 * Virtual DOM Node interface
 */
export interface VNode {
  type: string | Function;
  props: Record<string, any>;
  children: Array<VNode | string>;
  key?: string | number;
}

/**
 * Creates a virtual DOM node
 */
export function createElement(
  type: string | Function,
  props: Record<string, any> | null,
  ...children: any[]
): VNode {
  // Extract key from props
  const { key, ...restProps } = props || {};
  
  return {
    type,
    props: restProps || {},
    children: children.flat().filter(child => child !== null && child !== undefined),
    key: key || undefined
  };
}

/**
 * Compares two virtual nodes
 */
export function areNodesEqual(node1: VNode, node2: VNode): boolean {
  return node1.type === node2.type && node1.key === node2.key;
} 