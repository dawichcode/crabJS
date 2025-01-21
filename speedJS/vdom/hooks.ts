import { Component } from './Component';

interface Hook {
  type: 'state' | 'effect' | 'memo' | 'callback' | 'ref' | 'reducer' | 'layoutEffect';
  value: any;
  deps?: any[];
  cleanup?: () => void;
}

let currentComponent: Component | null = null;
let currentHookIndex = 0;

export function setCurrentComponent(component: Component | null) {
  currentComponent = component;
  currentHookIndex = 0;
}

/**
 * useState Hook
 */
export function useState<T>(initialValue: T): [T, (newValue: T) => void] {
  if (!currentComponent) {
    throw new Error('Hooks can only be used in functional components');
  }

  const hooks = (currentComponent as any)._hooks || [];
  const hookIndex = currentHookIndex++;

  if (!hooks[hookIndex]) {
    hooks[hookIndex] = {
      type: 'state',
      value: typeof initialValue === 'function' ? initialValue() : initialValue
    };
  }

  const hook = hooks[hookIndex];

  const setState = (newValue: T) => {
    const nextValue = typeof newValue === 'function' 
      ? (newValue as Function)(hook.value) 
      : newValue;

    if (nextValue !== hook.value) {
      hook.value = nextValue;
      currentComponent?.forceUpdate();
    }
  };

  return [hook.value, setState];
}

/**
 * useEffect Hook
 */
export function useEffect(effect: () => void | (() => void), deps?: any[]) {
  if (!currentComponent) {
    throw new Error('Hooks can only be used in functional components');
  }

  const hooks = (currentComponent as any)._hooks || [];
  const hookIndex = currentHookIndex++;

  const hook = hooks[hookIndex] || {
    type: 'effect',
    deps: undefined,
    cleanup: undefined
  };

  const hasNoDeps = !deps;
  const hasChangedDeps = deps
    ? !hook.deps || 
      deps.length !== hook.deps.length || 
      deps.some((dep: any, i: number) => dep !== hook.deps[i])
    : true;

  if (hasNoDeps || hasChangedDeps) {
    // Run cleanup if it exists
    if (hook.cleanup) {
      hook.cleanup();
    }

    // Run effect and store cleanup
    hook.cleanup = effect();
    hook.deps = deps;
  }

  hooks[hookIndex] = hook;
}

/**
 * useMemo Hook
 */
export function useMemo<T>(factory: () => T, deps: any[]): T {
  if (!currentComponent) {
    throw new Error('Hooks can only be used in functional components');
  }

  const hooks = (currentComponent as any)._hooks || [];
  const hookIndex = currentHookIndex++;

  const hook = hooks[hookIndex] || {
    type: 'memo',
    deps: undefined,
    value: undefined
  };

  const hasChangedDeps = !hook.deps || 
    deps.length !== hook.deps.length || 
    deps.some((dep: any, i: number) => dep !== hook.deps[i]);

  if (hasChangedDeps) {
    hook.value = factory();
    hook.deps = deps;
  }

  hooks[hookIndex] = hook;
  return hook.value;
}

/**
 * useCallback Hook
 */
export function useCallback<T extends Function>(callback: T, deps: any[]): T {
  return useMemo(() => callback, deps);
}

/**
 * useRef Hook
 */
export interface RefObject<T> {
  current: T | null;
}

export function useRef<T>(initialValue: T | null = null): RefObject<T> {
  if (!currentComponent) {
    throw new Error('Hooks can only be used in functional components');
  }

  const hooks = (currentComponent as any)._hooks || [];
  const hookIndex = currentHookIndex++;

  if (!hooks[hookIndex]) {
    hooks[hookIndex] = {
      type: 'ref',
      value: { current: initialValue }
    };
  }

  return hooks[hookIndex].value;
}

/**
 * useReducer Hook
 */
export function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
  initializer?: (arg: S) => S
): [S, (action: A) => void] {
  if (!currentComponent) {
    throw new Error('Hooks can only be used in functional components');
  }

  const hooks = (currentComponent as any)._hooks || [];
  const hookIndex = currentHookIndex++;

  if (!hooks[hookIndex]) {
    const initial = initializer ? initializer(initialState) : initialState;
    hooks[hookIndex] = {
      type: 'reducer',
      value: initial,
      reducer
    };
  }

  const hook = hooks[hookIndex];

  const dispatch = (action: A) => {
    const nextState = hook.reducer(hook.value, action);
    if (nextState !== hook.value) {
      hook.value = nextState;
      currentComponent?.forceUpdate();
    }
  };

  return [hook.value, dispatch];
}

/**
 * useLayoutEffect Hook - Synchronous version of useEffect
 */
export function useLayoutEffect(effect: () => void | (() => void), deps?: any[]) {
  if (!currentComponent) {
    throw new Error('Hooks can only be used in functional components');
  }

  const hooks = (currentComponent as any)._hooks || [];
  const hookIndex = currentHookIndex++;

  const hook = hooks[hookIndex] || {
    type: 'layoutEffect',
    deps: undefined,
    cleanup: undefined
  };

  const hasChangedDeps = !hook.deps || 
    !deps || 
    deps.length !== hook.deps.length || 
    deps.some((dep: any, i: number) => dep !== hook.deps[i]);

  if (hasChangedDeps) {
    // Run cleanup synchronously
    if (hook.cleanup) {
      hook.cleanup();
    }

    // Run effect synchronously
    hook.cleanup = effect();
    hook.deps = deps;
  }

  hooks[hookIndex] = hook;
} 