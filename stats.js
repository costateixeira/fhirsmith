const { monitorEventLoopDelay } = require('perf_hooks');
const {cache} = require("express/lib/application");

class ServerStats {
  started = false;
  requestCount = 0;
  requestTime = 0;
  // Collect metrics every 10 minutes
  intervalMs = 10 * 60 * 1000;
  history = [];
  requestCountSnapshot = 0;
  startMem = 0;
  startTime = Date.now();
  timer;
  cachingModules = [];

  constructor() {
    this.timer = setInterval(() => {
      this.recordMetrics();
    }, this.intervalMs);
  }

  recordMetrics() {
    if (this.started) {
      const now = Date.now();

      const currentMem = process.memoryUsage().heapUsed;
      const requestsDelta = this.requestCount - this.requestCountSnapshot;
      const requestsTat = requestsDelta > 0 ? this.requestTime / requestsDelta : 0;
      const minutesSinceStart = this.history.length > 1
        ? this.intervalMs / 60000
        : (now - this.startTime) / 60000;
      const requestsPerMin = minutesSinceStart > 0 ? requestsDelta / minutesSinceStart : 0;
      const elapsedMs = (now - this.lastTime);
      const usage = process.cpuUsage(this.lastUsage);
      const cpuMs = (usage.user + usage.system) / 1000; // microseconds → milliseconds
      const percent = elapsedMs > 0 ? 100 * cpuMs / elapsedMs : 0;
      const loopDelay = this.eventLoopMonitor.mean / 1e6;
      let cacheCount = 0;
      for (let m of this.cachingModules) {
        cacheCount = cacheCount + m.cacheCount();
      }

      this.history.push({time: now, mem: currentMem - this.startMem, rpm: requestsPerMin, tat: requestsTat, cpu: percent, block: loopDelay, cache : cacheCount});

      this.eventLoopMonitor.reset();
      this.requestCountSnapshot = this.requestCount;
      this.requestTime = 0;
      this.lastUsage = process.cpuUsage();
      this.lastTime = now;

      // Prune old data (keep 24 hours)
      const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago
      this.history = this.history.filter(m => m.time > cutoff);
    }
  }

  markStarted() {
    this.started = true;
    this.startMem = process.memoryUsage().heapUsed;
    this.startTime = Date.now();
    this.lastUsage = process.cpuUsage();
    this.lastTime = this.startTime;
    this.eventLoopMonitor = monitorEventLoopDelay({ resolution: 20 });
    this.eventLoopMonitor.enable();
    this.recordMetrics();
  }

  countRequest(name, tat) {
    // we ignore name for now, but we might split the tat tracking up by name
    // at some stage
    this.requestCount++;
    this.requestTime = this.requestTime + tat;
  }

  finishStats() {
    clearInterval(this.timer);
  }
}
module.exports = ServerStats;