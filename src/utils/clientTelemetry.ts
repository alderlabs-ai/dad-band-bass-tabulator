import { appLog } from './logging';

type TelemetryLevel = 'info' | 'warn' | 'error';

type TelemetryValue = string | number | boolean | null | undefined | TelemetryObject | TelemetryValue[];

interface TelemetryObject {
  [key: string]: TelemetryValue;
}

interface TelemetryPayload {
  app: 'basstab-fe';
  level: TelemetryLevel;
  event: string;
  at: string;
  details?: TelemetryObject;
  context: {
    platform: string;
    href: string | null;
    userAgent: string | null;
  };
}

const productionBaseUrl = 'https://bass-tab-be-production.up.railway.app';
const sensitiveKeyPattern = /(password|token|secret|cookie|authorization|session)/i;
const maxStringLength = 300;
const maxEventsPerMinute = 30;
const eventWindowMs = 60_000;

const eventTimestamps: number[] = [];

const isProductionRuntime =
  process.env.NODE_ENV === 'production' ||
  (typeof globalThis !== 'undefined' &&
    typeof (globalThis as { __DEV__?: unknown }).__DEV__ === 'boolean' &&
    !(globalThis as { __DEV__?: boolean }).__DEV__);

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');
const shouldSendNgrokBypassHeader = (url: string): boolean => {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes('ngrok');
  } catch (_error) {
    return false;
  }
};

const getTelemetryBaseUrl = (): string | null => {
  const baseUrl = process.env.EXPO_PUBLIC_BASSTAB_API_URL?.trim();

  if (baseUrl) {
    return trimTrailingSlash(baseUrl);
  }

  if (isProductionRuntime) {
    return productionBaseUrl;
  }

  return null;
};

const shouldSendNow = () => {
  const now = Date.now();

  while (eventTimestamps.length > 0 && now - eventTimestamps[0] > eventWindowMs) {
    eventTimestamps.shift();
  }

  if (eventTimestamps.length >= maxEventsPerMinute) {
    return false;
  }

  eventTimestamps.push(now);
  return true;
};

const sanitizeString = (value: string): string => {
  if (value.length <= maxStringLength) {
    return value;
  }

  return `${value.slice(0, maxStringLength)}...`;
};

const sanitizeDetails = (value: TelemetryValue, key?: string): TelemetryValue => {
  if (key && sensitiveKeyPattern.test(key)) {
    return '[REDACTED]';
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeDetails(item));
  }

  const entries = Object.entries(value as TelemetryObject).slice(0, 40);
  const next: TelemetryObject = {};

  for (const [entryKey, entryValue] of entries) {
    next[entryKey] = sanitizeDetails(entryValue, entryKey);
  }

  return next;
};

const buildPayload = (
  level: TelemetryLevel,
  event: string,
  details?: TelemetryObject,
): TelemetryPayload => {
  const href =
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as { location?: { href?: unknown } }).location?.href === 'string'
      ? ((globalThis as { location?: { href?: string } }).location?.href ?? null)
      : null;
  const userAgent =
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as { navigator?: { userAgent?: unknown } }).navigator?.userAgent === 'string'
      ? ((globalThis as { navigator?: { userAgent?: string } }).navigator?.userAgent ?? null)
      : null;

  return {
    app: 'basstab-fe',
    level,
    event,
    at: new Date().toISOString(),
    ...(details ? { details: sanitizeDetails(details) as TelemetryObject } : {}),
    context: {
      platform: typeof globalThis !== 'undefined' ? 'web' : 'native',
      href,
      userAgent,
    },
  };
};

const sendPayload = async (payload: TelemetryPayload) => {
  const baseUrl = getTelemetryBaseUrl();

  if (!baseUrl || !shouldSendNow()) {
    return;
  }

  const url = `${baseUrl}/v1/client-logs`;
  const body = JSON.stringify(payload);
  const navigatorWithBeacon =
    typeof globalThis !== 'undefined'
      ? ((globalThis as { navigator?: { sendBeacon?: (url: string, data?: BodyInit | null) => boolean } })
        .navigator ?? null)
      : null;

  if (navigatorWithBeacon?.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigatorWithBeacon.sendBeacon(url, blob)) {
      return;
    }
  }

  await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(shouldSendNgrokBypassHeader(url) ? { 'ngrok-skip-browser-warning': 'true' } : {}),
    },
    body,
    keepalive: true,
  });
};

export const logClientEvent = (
  level: TelemetryLevel,
  event: string,
  details?: TelemetryObject,
) => {
  if (__DEV__) {
    appLog.info('[ClientTelemetry]', level, event, details ?? {});
  }

  void sendPayload(buildPayload(level, event, details)).catch((error) => {
    if (__DEV__) {
      appLog.warn('Client telemetry send failed', error);
    }
  });
};
