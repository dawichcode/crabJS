import { VNode, createElement } from './VNode';
import { Component } from './Component';
import { Reconciler } from './reconciler';
import { ErrorBoundary, ErrorInfo } from './ErrorBoundary';
import { Context, useContext } from './Context';
import { useState, useEffect, useMemo, useCallback, useRef, useReducer, useLayoutEffect } from './hooks';
import { FunctionalComponent } from './FunctionalComponent';

// JSX Factory
export function jsx(type: string | Function, props: Record<string, any> | null, ...children: any[]): VNode {
  return createElement(
    type,
    props || {},
    ...children.flat().filter(child => child !== null && child !== undefined)
  );
}

// Fragment support
export const Fragment = Symbol('Fragment');

// Create convenience method for mounting
export function render(component: Component, container: HTMLElement): void {
  component.mount(container);
}

// Re-export everything needed
export { 
  createElement, 
  Component, 
  VNode, 
  ErrorBoundary, 
  ErrorInfo, 
  Context, 
  useContext, 
  useState, 
  useEffect, 
  useMemo, 
  useCallback, 
  useRef,
  useReducer,
  useLayoutEffect,
  FunctionalComponent 
}; 