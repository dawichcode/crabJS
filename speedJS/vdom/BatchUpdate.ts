type UpdateCallback = () => void;

export class BatchUpdate {
  private static instance: BatchUpdate;
  private batchedCallbacks: Set<UpdateCallback> = new Set();
  private isBatchingUpdates: boolean = false;
  private timeout: number | null = null;

  public static getInstance(): BatchUpdate {
    if (!BatchUpdate.instance) {
      BatchUpdate.instance = new BatchUpdate();
    }
    return BatchUpdate.instance;
  }

  /**
   * Schedules an update to be executed in batch
   */
  public scheduleUpdate(callback: UpdateCallback): void {
    if (this.isBatchingUpdates) {
      this.batchedCallbacks.add(callback);
    } else {
      this.runImmediate(callback);
    }
  }

  /**
   * Starts a new batch of updates
   */
  public batchStart(): void {
    this.isBatchingUpdates = true;
  }

  /**
   * Ends current batch and processes all updates
   */
  public batchEnd(): void {
    this.isBatchingUpdates = false;
    this.flush();
  }

  /**
   * Runs callback immediately
   */
  private runImmediate(callback: UpdateCallback): void {
    try {
      callback();
    } catch (error) {
      console.error('Error in update:', error);
    }
  }

  /**
   * Processes all batched updates
   */
  private flush(): void {
    if (this.batchedCallbacks.size === 0) return;

    const callbacks = Array.from(this.batchedCallbacks);
    this.batchedCallbacks.clear();

    for (const callback of callbacks) {
      this.runImmediate(callback);
    }
  }

  /**
   * Wraps a function to batch its updates
   */
  public static wrap<T extends Function>(fn: T): T {
    return ((...args: any[]) => {
      const batch = BatchUpdate.getInstance();
      batch.batchStart();
      try {
        return fn(...args);
      } finally {
        batch.batchEnd();
      }
    }) as any;
  }
} 