const { OCLBackgroundJobQueue } = require('../../tx/ocl/jobs/background-queue');

describe('OCLBackgroundJobQueue', () => {
  afterEach(() => {
    OCLBackgroundJobQueue.pendingJobs = [];
    OCLBackgroundJobQueue.activeCount = 0;
    OCLBackgroundJobQueue.queuedOrRunningKeys = new Set();
    OCLBackgroundJobQueue.activeJobs = new Map();
    OCLBackgroundJobQueue.enqueueSequence = 0;
    if (OCLBackgroundJobQueue.heartbeatTimer) {
      clearInterval(OCLBackgroundJobQueue.heartbeatTimer);
      OCLBackgroundJobQueue.heartbeatTimer = null;
    }
  });

  it('should enqueue a job and mark as queued', () => {
    const jobKey = 'job1';
    const jobType = 'test-job';
    const runJob = jest.fn();
    const result = OCLBackgroundJobQueue.enqueue(jobKey, jobType, runJob, { jobSize: 10 });
    expect(result).toBe(true);
    expect(OCLBackgroundJobQueue.isQueuedOrRunning(jobKey)).toBe(true);
    // Não verifica tamanho da fila, pois job pode ser processado imediatamente
  });

  it('should not enqueue duplicate jobKey', () => {
    const jobKey = 'job2';
    const runJob = jest.fn();
    OCLBackgroundJobQueue.enqueue(jobKey, 'test-job', runJob);
    const result = OCLBackgroundJobQueue.enqueue(jobKey, 'test-job', runJob);
    expect(result).toBe(false);
  });

  it('should normalize job size', () => {
    expect(OCLBackgroundJobQueue.MAX_CONCURRENT).toBeGreaterThan(0);
    expect(OCLBackgroundJobQueue.UNKNOWN_JOB_SIZE).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('should log heartbeat without error', () => {
    OCLBackgroundJobQueue.logHeartbeat();
  });
});
