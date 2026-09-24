const pretty = require("pino-pretty");

const ignoredKeys = new Set([
  "level",
  "time",
  "pid",
  "hostname",
  "msg",
  "req",
  "res",
  "responseTime",
  "err",
]);

const eventStyles = {
  "PostgreSQL connected successfully": {
    icon: "🟡",
    color: "yellow",
  },
  "Server is running successfully": {
    icon: "🟣",
    color: "magenta",
  },
};

const levelStyles = {
  10: { icon: "⚪", color: "gray" },
  20: { icon: "🔵", color: "cyan" },
  30: { icon: "🟢", color: "green" },
  40: { icon: "🟡", color: "yellow" },
  50: { icon: "🔴", color: "red" },
  60: { icon: "🔴", color: "redBright" },
};

const labels = {
  database: "Database",
  environment: "Environment",
  host: "Host",
  messageId: "Message ID",
  module: "Module",
  port: "Port",
  remainingAttempts: "Retries left",
  requestId: "Request ID",
  signal: "Signal",
  sql: "SQL",
};

const humanize = (key) => {
  if (labels[key]) return labels[key];

  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
};

const stringify = (value) => {
  if (typeof value === "string") return value;
  if (["number", "boolean", "bigint"].includes(typeof value)) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "[unavailable]";
  }
};

const formatContext = (log, colors) => {
  const details = [];

  for (const [key, value] of Object.entries(log)) {
    if (ignoredKeys.has(key) || value === undefined || value === null) continue;

    details.push(
      `${colors.cyan(humanize(key))}: ${colors.white(stringify(value))}`
    );
  }

  const requestId = log.req?.id || log.reqId;
  if (requestId && !log.requestId) {
    details.push(`${colors.cyan("Request ID")}: ${colors.white(requestId)}`);
  }

  if (log.err?.message) {
    details.push(`${colors.red("Error")}: ${colors.white(log.err.message)}`);
  }

  return details.join(colors.dim(" • "));
};

const pad = (value) => String(value).padStart(2, "0");

const formatTimestamp = (epoch) => {
  const date = new Date(epoch);
  const hours = date.getHours();
  const twelveHour = hours % 12 || 12;
  const meridiem = hours >= 12 ? "PM" : "AM";
  const offsetMinutes = -date.getTimezoneOffset();
  const offsetSign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const offsetHours = pad(Math.floor(absoluteOffset / 60));
  const offsetRemainder = pad(absoluteOffset % 60);

  return [
    `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`,
    `${pad(twelveHour)}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    meridiem,
    `GMT${offsetSign}${offsetHours}:${offsetRemainder}`,
  ].join(" ");
};

const getStyle = (log, message) =>
  eventStyles[message] || levelStyles[log.level] || levelStyles[30];

const rgb = (r, g, b) => (text) => `\x1b[38;2;${r};${g};${b}m${text}\x1b[39m`;

const HTTP_STATUS_REGEX = /^HTTP \S+ \S+ → (\d{3})/;

const getHttpStyle = (statusCode, colors) => {
  if (statusCode >= 500) return { icon: "🔴", paint: rgb(255, 69, 58) };
  if (statusCode >= 400) return { icon: "🟠", paint: rgb(255, 149, 0) };
  return { icon: "🟢", paint: colors.green };
};

module.exports = (options) =>
  pretty({
    ...options,
    colorize: true,
    customColors: "message:reset",
    hideObject: true,
    singleLine: false,
    timestampKey: "formattedTimestamp",
    ignore: "pid,hostname",
    customPrettifiers: {
      level: () => "",
    },
    messageFormat(log, messageKey, _levelLabel, { colors }) {
      const message = log[messageKey] || "Log event";
      const context = formatContext(log, colors);
      const httpMatch = message.match(HTTP_STATUS_REGEX);
      const { icon, paint: colorizeMessage } = httpMatch
        ? getHttpStyle(Number(httpMatch[1]), colors)
        : (() => {
            const style = getStyle(log, message);
            return {
              icon: style.icon,
              paint: colors[style.color] || colors.white,
            };
          })();
      const lines = [`${icon} ${colors.bold(colorizeMessage(message))}`];

      if (context) lines.push(`   ${context}`);
      if (log.err?.stack) {
        const stackFrames = log.err.stack
          .split("\n")
          .filter((line) => line.trim().startsWith("at "))
          .filter((line) => !/node_modules|\(node:|at node:/.test(line))
          .map((line) => `     ${colors.dim(line.trim())}`);
        lines.push(...stackFrames);
      }
      lines.push(`   ${formatTimestamp(log.time)}`);

      return `${lines.join("\n")}\n`;
    },
  });
