// src/lib/logger.ts
//
// Тонкая абстракция логирования. Сейчас бэкенд — браузерный console.
// Когда подключим Sentry (или Datadog/LogRocket), достаточно поменять
// реализацию здесь — вызовы из компонентов трогать не нужно.
//
// Использование:
//   import { logger } from "@/lib/logger";
//   logger.error("Failed to load orders", error, { userId });
//   logger.warn("Slow image load", { src });
//   logger.info("User signed up", { method: "google" });

type Extra = Record<string, unknown>;

interface Logger {
  info(message: string, extra?: Extra): void;
  warn(message: string, extra?: Extra): void;
  error(message: string, error?: unknown, extra?: Extra): void;
  setUser(user: { id: string; email?: string } | null): void;
}

const isDev = import.meta.env.DEV;

class ConsoleLogger implements Logger {
  private user: { id: string; email?: string } | null = null;

  setUser(user: { id: string; email?: string } | null) {
    this.user = user;
  }

  info(message: string, extra?: Extra) {
    if (!isDev) return; // info-сообщения не пишем в проде, чтоб не шуметь.
    console.info(`[info] ${message}`, extra ?? "");
  }

  warn(message: string, extra?: Extra) {
    console.warn(`[warn] ${message}`, extra ?? "");
  }

  error(message: string, error?: unknown, extra?: Extra) {
    const context = { user: this.user, ...extra };
    if (error instanceof Error) {
      console.error(`[error] ${message}: ${error.message}`, { ...context, stack: error.stack });
    } else {
      console.error(`[error] ${message}`, error, context);
    }
  }
}

export const logger: Logger = new ConsoleLogger();

// Точка интеграции Sentry. Когда будет готов DSN:
//   1. npm i @sentry/react
//   2. в main.tsx: Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, ... })
//   3. заменить ConsoleLogger на SentryLogger, который вызывает Sentry.captureException
//      внутри error() и Sentry.setUser в setUser().
