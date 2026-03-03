const path = require('path');
const fs = require('fs');
const tmp = require('tmp');

const HtmlServer = require('../../library/html-server').constructor;

describe('About box', () => {
  let htmlServer;
  let tmpDir;

  beforeAll(() => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });
    htmlServer = new HtmlServer();
    htmlServer.useLog({ error: jest.fn(), warn: jest.fn() });

    // Load root template
    const templatePath = path.join(__dirname, '../../root-template.html');
    htmlServer.loadTemplate('root', templatePath);
  });

  afterAll(() => {
    tmpDir.removeCallback();
  });

  test('renders about content when provided', () => {
    const aboutHtml = '<div class="about">Custom About Content</div>';
    const html = htmlServer.renderPage('root', 'Test', '<p>Main</p>', {
      version: '1.0.0',
      processingTime: 0,
      about: aboutHtml
    });
    expect(html).toContain('Custom About Content');
    expect(html).toContain('<div class="about">');
  });

  test('renders empty when about is not provided', () => {
    const html = htmlServer.renderPage('root', 'Test', '<p>Main</p>', {
      version: '1.0.0',
      processingTime: 0
    });
    expect(html).not.toContain('[%about%]');
  });

  test('about.html is loaded from data directory when it exists', () => {
    const aboutContent = '<p>Server operated by Acme Corp</p>';
    fs.writeFileSync(path.join(tmpDir.name, 'about.html'), aboutContent);

    const aboutPath = path.join(tmpDir.name, 'about.html');
    expect(fs.existsSync(aboutPath)).toBe(true);

    const loaded = fs.readFileSync(aboutPath, 'utf8');
    expect(loaded).toBe(aboutContent);
  });

  test('missing about.html does not cause errors', () => {
    const aboutPath = path.join(tmpDir.name, 'nonexistent', 'about.html');
    expect(fs.existsSync(aboutPath)).toBe(false);
  });
});
