type LogMethod = (...args: unknown[]) => void;

const isEnabled = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
};

const globalLogFlag = isEnabled(process.env.EXPO_PUBLIC_ENABLE_LOGS);
const appLogEnabled = isEnabled(process.env.EXPO_PUBLIC_ENABLE_APP_LOGS) || globalLogFlag;
const beLogEnabled = isEnabled(process.env.EXPO_PUBLIC_ENABLE_BE_LOGS) || globalLogFlag;

const noop: LogMethod = () => {};

const createLogger = (enabled: boolean): Record<'info' | 'warn' | 'error' | 'debug' | 'log', LogMethod> => ({
  info: enabled ? (...args: unknown[]) => console.info(...args) : noop,
  warn: enabled ? (...args: unknown[]) => console.warn(...args) : noop,
  error: enabled ? (...args: unknown[]) => console.error(...args) : noop,
  debug: enabled ? (...args: unknown[]) => console.debug(...args) : noop,
  log: enabled ? (...args: unknown[]) => console.log(...args) : noop,
});

export const appLog = createLogger(appLogEnabled);
export const beLog = createLogger(beLogEnabled);
