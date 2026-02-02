const { monitorEventLoopDelay } = require('perf_hooks');
const {cache} = require("express/lib/application");

class ServerStats {
  started = false;
  requestCount = 0;
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
      const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago

      const currentMem = process.memoryUsage().heapUsed;
      const requestsDelta = this.requestCount - this.requestCountSnapshot;
      const minutesSinceStart = this.history.length > 1
        ? this.intervalMs / 60000
        : (now - this.startTime) / 60000;
      const requestsPerMin = minutesSinceStart > 0 ? requestsDelta / minutesSinceStart : 0;
      const elapsed = (now - this.lastTime) * 1000; // convert to microseconds
      const usage = process.cpuUsage(this.lastUsage);
      const percent = 100 * (usage.user + usage.system) / elapsed;
      const loopDelay = this.eventLoopMonitor.mean / 1e6;
      let cacheCount = 0;
      for (let m of this.cachingModules) {
        cacheCount = cacheCount + m.cacheCount();
      }
      this.eventLoopMonitor.reset();

      this.history.push({time: now, mem: currentMem - this.startMem, rpm: requestsPerMin, cpu: percent, block: loopDelay, cache : cacheCount});
      this.requestCountSnapshot = this.requestCount;
      this.lastUsage = process.cpuUsage();
      this.lastTime = now;

      // Prune old data (keep 24 hours)
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

  finishStats() {
    clearInterval(this.timer);
  }
}
module.exports = ServerStats;