export interface SyntheticEvent<T = Element> {
  nativeEvent: Event;
  currentTarget: T;
  target: EventTarget | null;
  type: string;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  timeStamp: number;

  preventDefault(): void;
  stopPropagation(): void;
  stopImmediatePropagation(): void;
  isPropagationStopped(): boolean;
  persist(): void;
}

export class BaseSyntheticEvent<T = Element> implements SyntheticEvent<T> {
  public nativeEvent: Event;
  public currentTarget: T;
  public target: EventTarget | null;
  public type: string;
  public bubbles: boolean;
  public cancelable: boolean;
  public defaultPrevented: boolean;
  public eventPhase: number;
  public isTrusted: boolean;
  public timeStamp: number;
  private _isPropagationStopped: boolean = false;

  constructor(nativeEvent: Event, currentTarget: T) {
    this.nativeEvent = nativeEvent;
    this.currentTarget = currentTarget;
    this.target = nativeEvent.target;
    this.type = nativeEvent.type;
    this.bubbles = nativeEvent.bubbles;
    this.cancelable = nativeEvent.cancelable;
    this.defaultPrevented = nativeEvent.defaultPrevented;
    this.eventPhase = nativeEvent.eventPhase;
    this.isTrusted = nativeEvent.isTrusted;
    this.timeStamp = nativeEvent.timeStamp;
  }

  preventDefault(): void {
    this.defaultPrevented = true;
    this.nativeEvent.preventDefault();
  }

  stopPropagation(): void {
    this._isPropagationStopped = true;
    this.nativeEvent.stopPropagation();
  }

  stopImmediatePropagation(): void {
    this._isPropagationStopped = true;
    this.nativeEvent.stopImmediatePropagation();
  }

  isPropagationStopped(): boolean {
    return this._isPropagationStopped;
  }

  persist(): void {
    // No-op in our implementation
  }
} 