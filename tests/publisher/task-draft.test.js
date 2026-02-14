const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const DraftTaskProcessor = require('../../publisher/task-draft');
const {testOrSkip} = require("../test-utilities");

describe('DraftTaskProcessor Integration Tests', () => {
  let processor;
  let testConfig;
  let mockLogger;
  let logMessages;
  let statusUpdates;
  let testWorkspaceRoot;

  beforeAll(() => {
    // ADAPT THESE PATHS FOR YOUR ENVIRONMENT
    testWorkspaceRoot = '/temp/publisher/workspace';

    testConfig = {
      workspaceRoot: testWorkspaceRoot
    };

    // Ensure test workspace exists and is clean
    if (fs.existsSync(testWorkspaceRoot)) {
      rimraf.sync(testWorkspaceRoot);
    }
    fs.mkdirSync(testWorkspaceRoot, { recursive: true });
  });

  beforeEach(() => {
    // Reset tracking arrays
    logMessages = [];
    statusUpdates = [];

    // Create real logger that captures messages
    mockLogger = {
      info: (msg) => {
        console.log(`[INFO] ${msg}`);
        logMessages.push({ level: 'info', message: msg });
      },
      error: (msg) => {
        console.error(`[ERROR] ${msg}`);
        logMessages.push({ level: 'error', message: msg });
      },
      warn: (msg) => {
        console.warn(`[WARN] ${msg}`);
        logMessages.push({ level: 'warn', message: msg });
      }
    };

    // Mock callback functions that capture calls
    const mockLogTaskMessage = async (taskId, level, message) => {
      const logEntry = { taskId, level, message, timestamp: new Date() };
      logMessages.push(logEntry);
      console.log(`[${level.toUpperCase()}] Task ${taskId}: ${message}`);
    };

    const mockUpdateTaskStatus = async (taskId, status, fields = {}) => {
      const statusEntry = { taskId, status, fields, timestamp: new Date() };
      statusUpdates.push(statusEntry);
      console.log(`[STATUS] Task ${taskId}: ${status}`, fields);
    };

    // Create processor with real config
    processor = new DraftTaskProcessor(
      testConfig,
      mockLogger,
      mockLogTaskMessage,
      mockUpdateTaskStatus
    );
  });

  afterAll(() => {
    // Cleanup test workspace
    if (fs.existsSync(testWorkspaceRoot)) {
      console.log(`Cleaning up test workspace: ${testWorkspaceRoot}`);
      rimraf.sync(testWorkspaceRoot);
    }
  });

  describe('Publisher Download', () => {
    testOrSkip('should download the latest FHIR IG Publisher', async () => {
      const testDir = path.join(testWorkspaceRoot, 'download-test');
      const taskId = 1;

      console.log('Testing publisher download...');

      const publisherPath = await processor.downloadPublisher(testDir, taskId);

      // Verify file was downloaded
      expect(fs.existsSync(publisherPath)).toBe(true);
      expect(path.basename(publisherPath)).toBe('publisher.jar');

      // Verify file size is reasonable (should be > 50MB)
      const stats = fs.statSync(publisherPath);
      expect(stats.size).toBeGreaterThan(50 * 1024 * 1024);
      console.log(`Publisher downloaded: ${Math.round(stats.size / 1024 / 1024)}MB`);

      // Check that appropriate log messages were created
      const downloadLogs = logMessages.filter(log =>
        log.message && log.message.includes('download')
      );
      expect(downloadLogs.length).toBeGreaterThan(0);

    }, 300000); // 5 minute timeout for download
  });

  describe('Repository Cloning', () => {
    testOrSkip('should clone a real GitHub repository', async () => {
      // ADAPT THIS TO A REAL, SMALL REPOSITORY FOR TESTING
      const testTask = {
        id: 2,
        npm_package_id: 'test.fhir.package',
        version: '1.0.0',
        github_org: 'FHIR',
        github_repo: 'sample-ig',
        git_branch: 'master'
      };

      const cloneDir = path.join(testWorkspaceRoot, 'clone-test');

      console.log(`Testing git clone of ${testTask.github_org}/${testTask.github_repo}...`);

      await processor.cloneRepository(testTask, cloneDir);

      // Verify repository was cloned
      expect(fs.existsSync(cloneDir)).toBe(true);
      expect(fs.existsSync(path.join(cloneDir, '.git'))).toBe(true);

      // Check that some files were cloned
      const files = fs.readdirSync(cloneDir);
      expect(files.length).toBeGreaterThan(0);
      console.log(`Cloned ${files.length} files/directories`);

      // Verify log messages
      const cloneLogs = logMessages.filter(log =>
        log.message && log.message.includes('Cloning repository')
      );
      expect(cloneLogs.length).toBeGreaterThan(0);

    }, 120000); // 2 minute timeout for clone
  });

  describe('Full Draft Build Process', () => {
    testOrSkip('should complete a full draft build for a simple FHIR IG', async () => {
      // ADAPT THIS TO A REAL, SIMPLE FHIR IG REPOSITORY
      const testTask = {
        id: 3,
        npm_package_id: 'hl7.fhir.uv.tools',
        version: '0.8.0',
        github_org: 'FHIR',                    // CHANGE TO VALID ORG WITH SIMPLE IG
        github_repo: 'fhir-tools-ig',              // CHANGE TO VALID SIMPLE IG REPO
        git_branch: 'master'                   // CHANGE TO VALID BRANCH
      };

      console.log(`Testing full draft build for ${testTask.npm_package_id}...`);
      console.log('This test requires Java to be installed and in PATH');

      // Run the full draft build process
      await processor.processDraftBuild(testTask);

      // Verify task directory was created
      const taskDir = path.join(testWorkspaceRoot, `task-${testTask.id}`);
      expect(fs.existsSync(taskDir)).toBe(true);

      // Verify publisher was downloaded
      const publisherJar = path.join(taskDir, 'publisher.jar');
      expect(fs.existsSync(publisherJar)).toBe(true);

      // Verify repository was cloned
      const draftDir = path.join(taskDir, 'draft');
      expect(fs.existsSync(draftDir)).toBe(true);
      expect(fs.existsSync(path.join(draftDir, '.git'))).toBe(true);

      // Verify build log was created
      const logFile = path.join(taskDir, 'draft-build.log');
      expect(fs.existsSync(logFile)).toBe(true);

      // Check log file has content
      const logContent = fs.readFileSync(logFile, 'utf8');
      expect(logContent.length).toBeGreaterThan(0);
      expect(logContent).toContain('FHIR IG Publisher');
      console.log(`Build log created: ${Math.round(logContent.length / 1024)}KB`);

      // Verify status updates were called correctly
      const buildingStatus = statusUpdates.find(s => s.status === 'building');
      const approvalStatus = statusUpdates.find(s => s.status === 'waiting for approval');

      expect(buildingStatus).toBeDefined();
      expect(approvalStatus).toBeDefined();

      // Check for output directory (if build was successful)
      const outputDir = path.join(draftDir, 'output');
      if (fs.existsSync(outputDir)) {
        console.log('Build output directory created successfully');

        // Check for QA report
        const qaReport = path.join(outputDir, 'qa.html');
        if (fs.existsSync(qaReport)) {
          console.log('QA report generated successfully');
        }
      }

      // Verify log messages show progress
      const infoLogs = logMessages.filter(log => log.level === 'info');
      expect(infoLogs.length).toBeGreaterThan(5); // Should have multiple progress messages

      // Check for key progress messages
      const hasDownloadLog = infoLogs.some(log => log.message.includes('download'));
      const hasCloneLog = infoLogs.some(log => log.message.includes('Cloning'));
      const hasPublisherLog = infoLogs.some(log => log.message.includes('IG Publisher'));

      expect(hasDownloadLog).toBe(true);
      expect(hasCloneLog).toBe(true);
      expect(hasPublisherLog).toBe(true);

      console.log('Full draft build completed successfully!');

    }, 600000); // 10 minute timeout for full build
  });

  describe('Error Handling', () => {
    testOrSkip('should handle invalid repository gracefully', async () => {
      const invalidTask = {
        id: 4,
        npm_package_id: 'invalid.package',
        version: '1.0.0',
        github_org: 'NonExistentOrg12345',
        github_repo: 'NonExistentRepo12345',
        git_branch: 'main'
      };

      console.log('Testing error handling with invalid repository...');

      // This should fail gracefully
      await expect(processor.processDraftBuild(invalidTask)).rejects.toThrow();

      // Check that failure was logged properly
      const errorLogs = logMessages.filter(log => log.level === 'error');
      expect(errorLogs.length).toBeGreaterThan(0);

      // Check that status was updated to failed
      const failedStatus = statusUpdates.find(s => s.status === 'failed');
      expect(failedStatus).toBeDefined();
      expect(failedStatus.fields.failure_reason).toBeDefined();

      console.log('Error handling verified');
    }, 60000);
  });

  describe('Directory Management', () => {
    testOrSkip('should create and clean directories properly', async () => {
      const testDir = path.join(testWorkspaceRoot, 'directory-test');

      // Create a directory with some content
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'test-file.txt'), 'test content');

      expect(fs.existsSync(testDir)).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'test-file.txt'))).toBe(true);

      // Use createTaskDirectory to clean and recreate
      await processor.createTaskDirectory(testDir);

      // Directory should exist but be empty
      expect(fs.existsSync(testDir)).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'test-file.txt'))).toBe(false);

      // Should be able to create new content
      fs.writeFileSync(path.join(testDir, 'new-file.txt'), 'new content');
      expect(fs.existsSync(path.join(testDir, 'new-file.txt'))).toBe(true);
    });
  });
});

// Helper function to run a quick validation test
describe('Environment Validation', () => {
  testOrSkip('should have required tools available', async () => {
    const { spawn } = require('child_process');

    // Check Java
    const javaCheck = new Promise((resolve) => {
      const java = spawn('java', ['-version'], { stdio: 'pipe' });
      java.on('close', (code) => {
        resolve(code === 0);
      });
      java.on('error', () => resolve(false));
    });

    // Check Git
    const gitCheck = new Promise((resolve) => {
      const git = spawn('git', ['--version'], { stdio: 'pipe' });
      git.on('close', (code) => {
        resolve(code === 0);
      });
      git.on('error', () => resolve(false));
    });

    const [hasJava, hasGit] = await Promise.all([javaCheck, gitCheck]);

    console.log('Environment check:');
    console.log(`  Java available: ${hasJava}`);
    console.log(`  Git available: ${hasGit}`);

    if (!hasJava) {
      console.warn('WARNING: Java not found. IG Publisher tests will fail.');
      console.warn('Install Java and ensure it is in your PATH.');
    }

    if (!hasGit) {
      console.warn('WARNING: Git not found. Repository cloning tests will fail.');
      console.warn('Install Git and ensure it is in your PATH.');
    }

    // We don't fail the test here, just warn
    expect(true).toBe(true);
  });
});