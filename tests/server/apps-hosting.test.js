const express = require('express');
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const tmp = require('tmp');

describe('/apps SPA hosting', () => {
  let app;
  let tmpDir;

  beforeAll(() => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });
    const appsDir = path.join(tmpDir.name, 'apps');

    // Create a mock SPA: apps/testapp/index.html
    fs.mkdirSync(path.join(appsDir, 'testapp'), { recursive: true });
    fs.writeFileSync(path.join(appsDir, 'testapp', 'index.html'), '<html><body>Test App</body></html>');
    fs.writeFileSync(path.join(appsDir, 'testapp', 'about.html'), '<html><body>About</body></html>');

    app = express();
    app.use('/apps', express.static(appsDir, { extensions: ['html'] }));
    app.use('/apps/:app', (req, res, next) => {
      const indexPath = path.join(appsDir, req.params.app, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        next();
      }
    });
  });

  afterAll(() => {
    tmpDir.removeCallback();
  });

  test('/apps/testapp/index.html serves the app', async () => {
    const res = await request(app).get('/apps/testapp/index.html');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Test App');
  });

  test('/apps/testapp serves index.html (directory shortcut)', async () => {
    const res = await request(app).get('/apps/testapp').redirects(1);
    expect(res.status).toBe(200);
    expect(res.text).toContain('Test App');
  });

  test('/apps/testapp/about serves about.html (extension fallback)', async () => {
    const res = await request(app).get('/apps/testapp/about');
    expect(res.status).toBe(200);
    expect(res.text).toContain('About');
  });

  test('/apps/nonexistent returns 404', async () => {
    const res = await request(app).get('/apps/nonexistent');
    expect(res.status).toBe(404);
  });
});
