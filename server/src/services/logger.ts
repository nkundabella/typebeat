import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console(),
    // Uncomment the line below to also log errors to a file
    // new transports.File({ filename: 'logs/error.log', level: 'error' })
  ],
});
