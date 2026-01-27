class ServerStats {
  started = false;
  requestCount = 0;
  // Collect metrics every 10 minutes
  intervalMs = 10 * 60 * 1000;
  memoryHistory = [];
  requestHistory = [];
  requestCountSnapshot = 0;
  startMem = 0;
  startTime = Date.now();
  timer;

  constructor() {
    this.timer = setInterval(() => {
      this.recordMetrics();
    }, this.intervalMs);
  }

  recordMetrics() {
    if (this.started) {
      const now = Date.now();
      const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago

      // Record memory
      const currentMem = process.memoryUsage().heapUsed;
      this.memoryHistory.push({time: now, mem: currentMem - this.startMem});

      const requestsDelta = this.requestCount - this.requestCountSnapshot;
      const minutesSinceStart = this.memoryHistory.length > 1
        ? this.intervalMs / 60000
        : (now - this.startTime) / 60000;
      const requestsPerMin = minutesSinceStart > 0 ? requestsDelta / minutesSinceStart : 0;

      this.requestHistory.push({time: now, rpm: requestsPerMin});
      this.requestCountSnapshot = this.requestCount;

      // Prune old data (keep 24 hours)
      this.memoryHistory = this.memoryHistory.filter(m => m.time > cutoff);
      this.requestHistory = this.requestHistory.filter(r => r.time > cutoff);
    }
  }

  getMetricsData() {
    // Ensure we have current data point
    const now = Date.now();
    const lastMemory = this.memoryHistory[this.memoryHistory.length - 1];
    if (!lastMemory || (now - lastMemory.time) > 60000) {
      this.recordMetrics();
    }

    return {
      memoryHistory: this.memoryHistory,
      requestHistory: this.requestHistory,
      startMem: this.startMem
    };
  }

  markStarted() {
    this.started = true;
    this.startMem = process.memoryUsage().heapUsed;
    this.startTime = Date.now();
    this.recordMetrics();
  }

  finishStats() {
    clearInterval(this.timer);
  }
}
module.exports = ServerStats;