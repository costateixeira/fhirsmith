/**
 * Convert a cron expression to a human-readable summary
 * Supports standard 5-field cron: minute hour day-of-month month day-of-week
 * @param {string} cron
 * @returns {string}
 */
function describeCron(cron) {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) {
    return `Invalid cron expression (expected 5 fields, got ${parts.length})`;
  }

  const [minute, hour, dom, month, dow] = parts;

  const allStar = (f) => f === '*';
  const isStep = (f) => f.includes('/');
  const stepVal = (f) => parseInt(f.split('/')[1]);

  // Every minute: * * * * *
  if (allStar(minute) && allStar(hour) && allStar(dom) && allStar(month) && allStar(dow)) {
    return 'Every minute';
  }

  // */N minutes: */N * * * *
  if (isStep(minute) && allStar(hour) && allStar(dom) && allStar(month) && allStar(dow)) {
    const n = stepVal(minute);
    return n === 1 ? 'Every minute' : `Every ${n} minutes`;
  }

  // Every hour at minute M: M * * * *
  if (!allStar(minute) && !isStep(minute) && allStar(hour) && allStar(dom) && allStar(month) && allStar(dow)) {
    const m = parseInt(minute);
    return m === 0 ? 'Every hour, on the hour' : `Every hour at minute ${m}`;
  }

  // Every N hours: 0 */N * * *  (or M */N * * *)
  if (!isStep(minute) && isStep(hour) && allStar(dom) && allStar(month) && allStar(dow)) {
    const n = stepVal(hour);
    const m = parseInt(minute);
    const hourPart = n === 1 ? 'Every hour' : `Every ${n} hours`;
    return m === 0 ? hourPart : `${hourPart} at minute ${m}`;
  }

  // Specific hour and minute: M H * * *
  if (!allStar(minute) && !isStep(minute) && !allStar(hour) && !isStep(hour) && allStar(dom) && allStar(month) && allStar(dow)) {
    const timeStr = formatTime(hour, minute);
    return `Every day at ${timeStr}`;
  }

  // Specific day of week: M H * * D
  if (!allStar(minute) && !allStar(hour) && allStar(dom) && allStar(month) && !allStar(dow)) {
    const timeStr = formatTime(hour, minute);
    const days = parseDow(dow);
    return `${days} at ${timeStr}`;
  }

  // Specific day of month: M H D * *
  if (!allStar(minute) && !allStar(hour) && !allStar(dom) && !isStep(dom) && allStar(month) && allStar(dow)) {
    const timeStr = formatTime(hour, minute);
    const d = ordinal(parseInt(dom));
    return `On the ${d} of every month at ${timeStr}`;
  }

  // Specific month and day: M H D Mo *
  if (!allStar(minute) && !allStar(hour) && !allStar(dom) && !allStar(month) && allStar(dow)) {
    const timeStr = formatTime(hour, minute);
    const d = ordinal(parseInt(dom));
    const mo = parseMonth(month);
    return `Every year on ${mo} ${d} at ${timeStr}`;
  }

  // Fallback: describe each field
  return describeFallback(minute, hour, dom, month, dow);
}

function formatTime(hour, minute) {
  const h = parseInt(hour);
  const m = parseInt(minute);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, '0')}${period}`;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function parseDow(field) {
  const indices = expandField(field, 0, 7).map(d => d % 7);
  if (indices.length === 5 && !indices.includes(0) && !indices.includes(6)) return 'Weekdays';
  if (indices.length === 2 && indices.includes(0) && indices.includes(6)) return 'Weekends';
  return 'Every ' + indices.map(i => DOW_NAMES[i]).join(', ');
}

function parseMonth(field) {
  const indices = expandField(field, 1, 12);
  return indices.map(i => MONTH_NAMES[i]).join(', ');
}

function expandField(field, min, max) {
  const results = new Set();
  for (const part of field.split(',')) {
    if (part.includes('/')) {
      const [range, step] = part.split('/');
      const s = parseInt(step);
      const start = range === '*' ? min : parseInt(range);
      for (let i = start; i <= max; i += s) results.add(i);
    } else if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      for (let i = a; i <= b; i++) results.add(i);
    } else if (part === '*') {
      for (let i = min; i <= max; i++) results.add(i);
    } else {
      results.add(parseInt(part));
    }
  }
  return [...results].sort((a, b) => a - b);
}

function describeFallback(minute, hour, dom, month, dow) {
  const parts = [];
  if (minute !== '*') parts.push(`minute ${minute}`);
  if (hour !== '*') parts.push(`hour ${hour}`);
  if (dom !== '*') parts.push(`day ${dom}`);
  if (month !== '*') parts.push(`month ${month}`);
  if (dow !== '*') parts.push(`weekday ${dow}`);
  return `Runs at: ${parts.join(', ')}`;
}

module.exports = { describeCron };
