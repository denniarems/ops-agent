/**
 * API Call Debugger Utility
 * 
 * Temporary debugging utility to monitor API calls and detect infinite loops
 * Can be imported and used in hooks during development to track call patterns
 */

interface APICallLog {
  url: string;
  timestamp: number;
  caller: string;
}

class APICallDebugger {
  private calls: APICallLog[] = [];
  private readonly maxCalls = 100;
  private readonly warningThreshold = 5; // Warn if same API called more than 5 times in 10 seconds

  /**
   * Log an API call
   */
  logCall(url: string, caller: string = 'unknown') {
    const timestamp = Date.now();
    
    this.calls.push({ url, timestamp, caller });
    
    // Keep only recent calls
    if (this.calls.length > this.maxCalls) {
      this.calls = this.calls.slice(-this.maxCalls);
    }
    
    // Check for potential infinite loops
    this.checkForInfiniteLoop(url, timestamp);
  }

  /**
   * Check if an API is being called too frequently (potential infinite loop)
   */
  private checkForInfiniteLoop(url: string, currentTimestamp: number) {
    const tenSecondsAgo = currentTimestamp - 10000;
    
    const recentCallsToSameURL = this.calls.filter(
      call => call.url === url && call.timestamp > tenSecondsAgo
    );
    
    if (recentCallsToSameURL.length > this.warningThreshold) {
      console.warn(
        `🚨 POTENTIAL INFINITE LOOP DETECTED 🚨\n` +
        `URL: ${url}\n` +
        `Calls in last 10 seconds: ${recentCallsToSameURL.length}\n` +
        `Callers: ${[...new Set(recentCallsToSameURL.map(c => c.caller))].join(', ')}\n` +
        `Consider checking useEffect dependencies and callback stability.`
      );
      
      // Log call pattern for debugging
      console.table(recentCallsToSameURL);
    }
  }

  /**
   * Get call statistics
   */
  getStats() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentCalls = this.calls.filter(call => call.timestamp > oneMinuteAgo);
    const urlCounts = recentCalls.reduce((acc, call) => {
      acc[call.url] = (acc[call.url] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalCallsLastMinute: recentCalls.length,
      urlBreakdown: urlCounts,
      mostFrequentURL: Object.entries(urlCounts).sort(([,a], [,b]) => b - a)[0]
    };
  }

  /**
   * Clear all logged calls
   */
  clear() {
    this.calls = [];
  }

  /**
   * Print current statistics to console
   */
  printStats() {
    const stats = this.getStats();
    console.log('📊 API Call Statistics (Last Minute):', stats);
  }
}

// Singleton instance
const apiDebugger = new APICallDebugger();

/**
 * Hook to add API call logging to any function
 * Usage: const loggedFetch = useAPICallLogger(fetchFunction, 'MyComponent');
 */
export const useAPICallLogger = <T extends (...args: any[]) => any>(
  fn: T,
  caller: string
): T => {
  return ((...args: any[]) => {
    // Extract URL from first argument if it's a string
    const url = typeof args[0] === 'string' ? args[0] : 'unknown-url';
    apiDebugger.logCall(url, caller);
    
    return fn(...args);
  }) as T;
};

/**
 * Manual logging function
 */
export const logAPICall = (url: string, caller: string) => {
  apiDebugger.logCall(url, caller);
};

/**
 * Get debugging statistics
 */
export const getAPIStats = () => apiDebugger.getStats();

/**
 * Print statistics to console
 */
export const printAPIStats = () => apiDebugger.printStats();

/**
 * Clear all logs
 */
export const clearAPILogs = () => apiDebugger.clear();

export default apiDebugger;
