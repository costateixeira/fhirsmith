const path = require('path');

const HtmlServer = require('../../library/html-server').constructor;

describe('sendErrorResponse headers-sent guard', () => {
  let htmlServer;
  let mockLog;

  beforeAll(() => {
    htmlServer = new HtmlServer();
    mockLog = { error: jest.fn(), warn: jest.fn(), info: jest.fn() };
    htmlServer.useLog(mockLog);

    const templatePath = path.join(__dirname, '../../root-template.html');
    htmlServer.loadTemplate('root', templatePath);
  });

  beforeEach(() => {
    mockLog.error.mockClear();
  });

  test('does not throw when headers already sent', () => {
    const res = {
      headersSent: true,
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    // Should not throw
    htmlServer.sendErrorResponse(res, 'root', new Error('test error'));

    // Should log the error instead of trying to send
    expect(mockLog.error).toHaveBeenCalledWith(
      expect.stringContaining('headers already sent'),
      expect.stringContaining('test error')
    );
    // Should NOT attempt to send a response
    expect(res.send).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('sends error response normally when headers not yet sent', () => {
    const res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    htmlServer.sendErrorResponse(res, 'root', new Error('something broke'));

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalled();
    const html = res.send.mock.calls[0][0];
    expect(html).toContain('something broke');
  });

  test('falls back to plain HTML when template rendering fails', () => {
    const res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(() => { throw new Error('setHeader fail'); }),
      send: jest.fn(),
    };

    // 'nonexistent' template will cause renderPage to produce output,
    // but setHeader throws, so it falls to the inner catch
    htmlServer.sendErrorResponse(res, 'nonexistent', new Error('original error'));

    expect(mockLog.error).toHaveBeenCalled();
    // The fallback send should still be attempted
    expect(res.send).toHaveBeenCalled();
  });
});
