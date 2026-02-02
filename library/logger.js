const winston = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');
const folders = require('./folder-setup');

class Logger {
  static _instance = null;

  static getInstance(options = {}) {
    if (!Logger._instance) {
      Logger._instance = new Logger(options);
    }
    return Logger._instance;
  }

  constructor(options = {}) {
    this.options = {
      level: options.level || 'info',
      logDir: options.logDir || folders.logsDir(),
      console: options.console !== undefined ? options.console : true,
      consoleErrors: options.consoleErrors !== undefined ? options.consoleErrors : false,
      telnetErrors: options.telnetErrors !== undefined ? options.telnetErrors : false,
      file: {
        filename: options.file?.filename || 'server-%DATE%.log',
        datePattern: options.file?.datePattern || 'YYYY-MM-DD',
        maxSize: options.file?.maxSize || '20m',
        maxFiles: options.file?.maxFiles || 14
      }
    };

    // Ensure log directory exists
    if (!fs.existsSync(this.options.logDir)) {
      fs.mkdirSync(this.options.logDir, { recursive: true });
    }

    // Telnet clients storage
    this.telnetClients = new Set();

    this._createLogger();

    // Log logger initialization
    this.info('Logger initialized @ ' + this.options.logDir, {
      level: this.options.level,
      logDir: this.options.logDir
    });
  }

  _createLogger() {
    // Define formats for file output (with full metadata including stack traces)
    const fileFormats = [
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ];

    // Create transports
    const transports = [];

    // Add file transport with rotation (includes ALL levels with full metadata)
    const fileTransport = new winston.transports.DailyRotateFile({
      dirname: this.options.logDir,
      filename: this.options.file.filename,
      datePattern: this.options.file.datePattern,
      maxSize: this.options.file.maxSize,
      maxFiles: this.options.file.maxFiles,
      level: this.options.level,
      format: winston.format.combine(...fileFormats)
    });
    transports.push(fileTransport);

    // Add console transport if enabled
    if (this.options.console) {
      const consoleFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.errors({ stack: true }),
        winston.format.colorize({ all: true }),
        winston.format.printf(info => {
          const stack = info.stack ? `\n${info.stack}` : '';
          return `${info.timestamp} ${info.level.padEnd(7)} ${info.message}${stack}`;
        })
      );

      const consoleTransport = new winston.transports.Console({
        level: this.options.level,
        format: consoleFormat
      });

      transports.push(consoleTransport);
    }

    // Create the winston logger
    this.logger = winston.createLogger({
      level: this.options.level,
      transports,
      exitOnError: false
    });
  }

  // Telnet client management
  addTelnetClient(socket) {
    this.telnetClients.add(socket);
  }

  removeTelnetClient(socket) {
    this.telnetClients.delete(socket);
  }

  _sendToTelnet(level, message, stack, options) {
    // Check if we should send errors/warnings to telnet
    if (!options.telnetErrors && (level === 'error' || level === 'warn')) {
      return;
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 23);
    let line = `${timestamp} ${level.padEnd(7)} ${message}\n`;
    if (stack) {
      line += stack + '\n';
    }

    for (const client of this.telnetClients) {
      try {
        client.write(line);
      } catch (e) {
        // Client disconnected, remove it
        this.telnetClients.delete(client);
      }
    }
  }

  _shouldLogToConsole(level, options) {
    if (level === 'error' || level === 'warn') {
      return options.consoleErrors;
    }
    return true;
  }

  _log(level, messageOrError, meta, options) {
    let message;
    let stack;

    // Check if we should skip console for errors/warnings
    const skipConsole = !this._shouldLogToConsole(level, options);

    // Handle Error objects
    if (messageOrError instanceof Error) {
      message = messageOrError.message;
      stack = messageOrError.stack;
      if (skipConsole) {
        // Log only to file transport
        this.logger.transports
          .filter(t => !(t instanceof winston.transports.Console))
          .forEach(t => t.log({ level, message, stack, ...meta }));
      } else {
        this.logger[level](message, {stack, ...meta});
      }
    } else {
      message = String(messageOrError);
      stack = meta?.stack;
      if (skipConsole) {
        this.logger.transports
          .filter(t => !(t instanceof winston.transports.Console))
          .forEach(t => t.log({ level, message, ...meta }));
      } else {
        this.logger[level](message, meta);
      }
    }

    this._sendToTelnet(level, message, stack, options);
  }

  error(message, meta = {}) {
    this._log('error', message, meta, this.options);
  }

  warn(message, meta = {}) {
    this._log('warn', message, meta, this.options);
  }

  info(message, meta = {}) {
    this._log('info', message, meta, this.options);
  }

  debug(message, meta = {}) {
    this._log('debug', message, meta, this.options);
  }

  verbose(message, meta = {}) {
    this._log('verbose', message, meta, this.options);
  }

  log(level, message, meta = {}) {
    this._log(level, message, meta, this.options);
  }

  child(defaultMeta = {}) {
    const self = this;

    // Build module-specific options
    const childOptions = {
      consoleErrors: defaultMeta.consoleErrors ?? self.options.consoleErrors,
      telnetErrors: defaultMeta.telnetErrors ?? self.options.telnetErrors
    };

    // Remove our custom options from defaultMeta so they don't pollute log output
    const cleanMeta = { ...defaultMeta };
    delete cleanMeta.consoleErrors;
    delete cleanMeta.telnetErrors;

    if (cleanMeta.module) {
      const modulePrefix = `{${cleanMeta.module}}`;

      return {
        error: (messageOrError, meta = {}) => {
          if (messageOrError instanceof Error) {
            const prefixedError = new Error(`${modulePrefix}: ${messageOrError.message}`);
            prefixedError.stack = messageOrError.stack;
            self._log('error', prefixedError, meta, childOptions);
          } else {
            self._log('error', `${modulePrefix}: ${messageOrError}`, meta, childOptions);
          }
        },
        warn: (messageOrError, meta = {}) => {
          if (messageOrError instanceof Error) {
            const prefixedError = new Error(`${modulePrefix}: ${messageOrError.message}`);
            prefixedError.stack = messageOrError.stack;
            self._log('warn', prefixedError, meta, childOptions);
          } else {
            self._log('warn', `${modulePrefix}: ${messageOrError}`, meta, childOptions);
          }
        },
        info: (message, meta = {}) => self._log('info', `${modulePrefix}: ${message}`, meta, childOptions),
        debug: (message, meta = {}) => self._log('debug', `${modulePrefix}: ${message}`, meta, childOptions),
        verbose: (message, meta = {}) => self._log('verbose', `${modulePrefix}: ${message}`, meta, childOptions),
        log: (level, message, meta = {}) => self._log(level, `${modulePrefix}: ${message}`, meta, childOptions)
      };
    }

    // For other metadata without module prefix
    const childLogger = {
      error: (messageOrError, meta = {}) => self._log('error', messageOrError, { ...cleanMeta, ...meta }, childOptions),
      warn: (messageOrError, meta = {}) => self._log('warn', messageOrError, { ...cleanMeta, ...meta }, childOptions),
      info: (message, meta = {}) => self._log('info', message, { ...cleanMeta, ...meta }, childOptions),
      debug: (message, meta = {}) => self._log('debug', message, { ...cleanMeta, ...meta }, childOptions),
      verbose: (message, meta = {}) => self._log('verbose', message, { ...cleanMeta, ...meta }, childOptions),
      log: (level, message, meta = {}) => self._log(level, message, { ...cleanMeta, ...meta }, childOptions)
    };

    return childLogger;
  }

  setLevel(level) {
    this.options.level = level;
    this.logger.transports.forEach(transport => {
      transport.level = level;
    });
    this.info(`Log level changed to ${level}`);
  }

  setConsoleErrors(enabled) {
    this.options.consoleErrors = enabled;
    this.info(`Console errors ${enabled ? 'enabled' : 'disabled'}`);
  }

  setTelnetErrors(enabled) {
    this.options.telnetErrors = enabled;
    this.info(`Telnet errors ${enabled ? 'enabled' : 'disabled'}`);
  }

  stream() {
    return {
      write: (message) => {
        this.info(message.trim());
      }
    };
  }
}

module.exports = Logger;