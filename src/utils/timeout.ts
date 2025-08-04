/**
 * Utility function to add timeout to any Promise
 * Prevents infinite loading by forcing promises to resolve or reject within a specified time
 */
export const withTimeout = <T>(
    promise: Promise<T>,
    timeoutMs: number = 15000,
    timeoutMessage?: string
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      // Set up the timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(timeoutMessage || `Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
  
      // Execute the original promise
      promise
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  };
  
  /**
   * Retry a promise-based operation with exponential backoff
   */
  export const withRetry = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
  
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
  
        // Exponential backoff: wait longer between each retry
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  
    throw lastError!;
  };
  
  /**
   * Combine timeout and retry for maximum resilience
   */
  export const withTimeoutAndRetry = <T>(
    operation: () => Promise<T>,
    timeoutMs: number = 15000,
    maxRetries: number = 2,
    baseDelay: number = 1000
  ): Promise<T> => {
    return withRetry(
      () => withTimeout(operation(), timeoutMs),
      maxRetries,
      baseDelay
    );
  };