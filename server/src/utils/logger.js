const winston = require("winston");

const isDev = process.env.NODE_ENV !== "production";

const logger = winston.createLogger({
  level: isDev ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true })
  ),
  transports: [
    new winston.transports.Console({
      format: isDev
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message }) => {
              return `${timestamp} [${level}]: ${message}`;
            })
          )
        : winston.format.json(),
    }),
  ],
});

module.exports = logger;
