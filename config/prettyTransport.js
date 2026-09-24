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
  "error",
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
  userId: "User ID",
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

const keyOrder = ["requestId", "handler", "userId"];

const getKeyOrder = (key) => {
  const index = keyOrder.indexOf(key);
  return index === -1 ? keyOrder.length : index;
};

const formatContext = (log, colors) => {
  const details = [];

  const orderedEntries = Object.entries(log).sort(
    ([first], [second]) => getKeyOrder(first) - getKeyOrder(second)
  );

  for (const [key, value] of orderedEntries) {
    if (ignoredKeys.has(key) || value === undefined || value === null) continue;

    details.push(
      `${colors.cyan(humanize(key))}: ${colors.white(stringify(value))}`
    );
  }

  const requestId = log.req?.id || log.reqId;
  if (requestId && !log.requestId) {
    details.push(`${colors.cyan("Request ID")}: ${colors.white(requestId)}`);
  }

  if (log.err?.message && !log.error) {
    details.push(`${colors.red("Error")}: ${colors.white(log.err.message)}`);
  }

  return details.join(colors.dim(" • "));
};

const formatError = (error, colors) => {
  const field = (label, value) =>
    value ? `${colors.red(label)}: ${colors.white(value)}` : undefined;
  const join = (...fields) => fields.filter(Boolean).join(colors.dim(" • "));

  return [
    field("Error", error.message),
    join(
      field("Type", error.type),
      field("Code", error.code),
      field("Database", error.database)
    ),
    field("Location", error.location),
  ]
    .filter(Boolean)
    .map((line) => `   ${line}`);
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
      if (log.error) lines.push(...formatError(log.error, colors));
      lines.push(`   ${formatTimestamp(log.time)}`);

      return `${lines.join("\n")}\n`;
    },
  });
