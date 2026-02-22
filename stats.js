const { monitorEventLoopDelay } = require('perf_hooks');
const {Utilities} = require("./library/utilities");
const escape = require('escape-html');

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
  taskMap = new Map();

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

      const currentCpu = this.readSystemCpu();
      const idleDelta = currentCpu.idle - this.lastUsage.idle;
      const totalDelta = currentCpu.total - this.lastUsage.total;
      const percent = totalDelta > 0 ? 100 * (1 - idleDelta / totalDelta) : 0;
      
      const loopDelay = this.eventLoopMonitor.mean / 1e6;
      let cacheCount = 0;
      for (let m of this.cachingModules) {
        cacheCount = cacheCount + m.cacheCount();
      }

      this.history.push({time: now, mem: currentMem - this.startMem, rpm: requestsPerMin, tat: requestsTat, cpu: percent, block: loopDelay, cache : cacheCount});

      this.eventLoopMonitor.reset();
      this.requestCountSnapshot = this.requestCount;
      this.requestTime = 0;
      this.lastTime = now;
      this.lastUsage = currentCpu;
      
      // Prune old data (keep 24 hours)
      const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago
      this.history = this.history.filter(m => m.time > cutoff);
    }
  }

  markStarted() {
    this.started = true;
    this.startMem = process.memoryUsage().heapUsed;
    this.startTime = Date.now();
    this.lastUsage = this.readSystemCpu();
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

  addTask(name, frequency) {
    let info = {};
    this.taskMap.set(name, info);
    info.frequency = frequency;
    info.state = "Started";
  }

  task(name, state) {
    let info = this.taskMap.get(name);
    if (info) {
      info.date = Date.now();
      info.state = state;
    }
  }

  taskDetails() {
    if (this.taskMap.size == 0) {
      return "";
    }
    let html = '<table class="grid"><tr style="background-color: #EEEEEE"><th colspan="4">Background Tasks</th></tr>';
    html += "<tr><th>Task</th><th>Status</th><th>Frequency</th><th>Last Seen</th></tr>";
    for (let m of this.taskMap.keys()) {
      html += "<tr><td>";
      html += escape(m);
      html += "</td><td>";
      html += escape(this.taskMap.get(m).state);
      html += "</td><td>";
      html += this.taskMap.get(m).frequency;
      html += "</td><td>";
      html += Utilities.formatDuration(this.taskMap.get(m).date, Date.now());
      html += "</td></tr>";
    }
    html += "</table>";
    return html;
  }

  finishStats() {
    clearInterval(this.timer);
  }

  readSystemCpu() {
    const os = require('os');
    const cpus = os.cpus();
    let idle = 0, total = 0;
    for (const cpu of cpus) {
      idle += cpu.times.idle;
      total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
    }
    return { idle, total };
  }

}
module.exports = ServerStats;