const { monitorEventLoopDelay } = require('perf_hooks');
const {Utilities} = require("./library/utilities");
const escape = require('escape-html');

class ServerStats {
  started = false;
  requestCount = 0;
  staticRequestCount = 0;
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
      const combinedCount = this.requestCount + this.staticRequestCount;
      const requestsDelta = combinedCount - this.requestCountSnapshot;
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
      this.requestCountSnapshot = combinedCount;
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
    info.status = "started"
  }

  task(name, state) {
    let info = this.taskMap.get(name);
    if (info) {
      info.date = Date.now();
      info.state = state;
      info.status = 'working';
    }
  }

  taskDone(name, state) {
    let info = this.taskMap.get(name);
    if (info) {
      info.date = Date.now();
      info.state = state;
      info.status = 'resting';
    }
  }

  taskError(name, state) {
    let info = this.taskMap.get(name);
    if (info) {
      info.date = Date.now();
      info.state = state;
      info.status = 'error';
    }
  }

  taskDetails() {
    if (this.taskMap.size == 0) {
      return "";
    }
    let html = '<table class="grid">';
    html += "<tr><th>Background Task</th><th>Status</th><th>Frequency</th><th>Last Seen</th></tr>";
    for (let m of this.taskMap.keys()) {
      let mm = this.taskMap.get(m);
      let color = this.getTaskColor(mm.status);
      html += `<tr style="background-color: ${color}"><td>`;
      html += escape(m);
      html += "</td><td>";
      html += escape(mm.state);
      html += "</td><td>";
      html += mm.frequency;
      html += "</td><td>";
      html += Utilities.formatDuration(mm.date, Date.now());
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

  getTaskColor(status) {
    switch (status) {
      case "started": return "LightGrey";
      case "working": return "LightGreen";
      case "resting": return "White";
      case "error": return "LightRed";
      default: return "DarkBlue"; // should not happen
    }
  }
}
module.exports = ServerStats;