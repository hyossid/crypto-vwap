import {
  CallHandler,
  ExecutionContext,
  INestApplication,
  INestApplicationContext,
  LoggerService,
} from '@nestjs/common';
import { toErrorDetailsHttpException } from '@root/commons/errors/to-http-error';
import { createNamespace } from 'cls-hooked';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import safeJsonStringify from 'safe-json-stringify';

const defaultContext = 'NestApplication';
export const CloudLoggingAsyncNamespace = createNamespace(
  'google-cloud-logging',
);

export const createExecutionId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(1);

function isWebApp(
  app: INestApplication | INestApplicationContext,
): app is INestApplication {
  return 'listen' in app;
}

export class GoogleCloudLoggingService implements LoggerService {
  constructor(
    app: INestApplication | INestApplicationContext,
    levels: string[],
  ) {
    for (const level of ['log', 'error', 'warn', 'debug', 'verbose']) {
      if (Array.isArray(levels) && levels.indexOf(level) < 0) {
        (this as any)[level] = new Function();
      }
    }
    if (isWebApp(app)) {
      const projectId = process.env.PROJECT_ID ?? 'fifth-compiler-334213';
      app.useGlobalInterceptors({
        async intercept(
          context: ExecutionContext,
          next: CallHandler,
        ): Promise<Observable<any>> {
          const req = context.switchToHttp().getRequest<Request>();
          const executionId = createExecutionId();
          const ctx = CloudLoggingAsyncNamespace.createContext();
          CloudLoggingAsyncNamespace.enter(ctx);
          const traceHeader = req.headers['x-cloud-trace-context'];
          const [traceId] = traceHeader ? String(traceHeader).split('/') : [];
          const trace = traceId
            ? `projects/${projectId}/traces/${traceId}`
            : undefined;
          if (trace) {
            CloudLoggingAsyncNamespace.set('trace', trace);
          }
          CloudLoggingAsyncNamespace.set('firestoreRequests', 0);
          CloudLoggingAsyncNamespace.set('executionId', executionId);
          const requestUserId = (req as any).__currentUser?.uid ?? '';
          const start = Date.now();
          const logRequest = (statusCode: number) => {
            console.log(
              safeJsonStringify({
                severity: 'DEFAULT',
                message: `[GoogleCloudLoggingService] request to ${req.method} ${req.url} finished with status ${statusCode}`,
                context: 'GoogleCloudLoggingService',
                executionId,
                requestUserId,
                'logging.googleapis.com/trace': trace,
                cost: Date.now() - start,
                firestoreRequests:
                  CloudLoggingAsyncNamespace.get('firestoreRequests'),
              }),
            );
          };
          return next.handle().pipe(
            tap({
              error: err => {
                const statusDetails = toErrorDetailsHttpException(err);
                const { apiError } = statusDetails;
                const statusCode = statusDetails.getStatus();

                if (statusCode >= 500) {
                  console.log(
                    safeJsonStringify({
                      severity: 'ERROR',
                      message: `[GoogleCloudLoggingService] Error requesting ${
                        req.url
                      } ${safeJsonStringify(req.body)} : ${
                        apiError.error.message
                      }`,
                      stack: err?.stack,
                      'logging.googleapis.com/trace': trace,
                      context: 'GoogleCloudLoggingService',
                      executionId,
                      requestUserId,
                    }),
                  );
                } else if (statusCode >= 400) {
                  console.log(
                    safeJsonStringify({
                      severity: 'WARNING',
                      message: `[GoogleCloudLoggingService] Error requesting ${
                        req.method
                      } ${req.url} ${safeJsonStringify(req.body)} ${
                        apiError.error.status
                      }: ${apiError.error.message}`,
                      stack: err?.stack,
                      'logging.googleapis.com/trace': trace,
                      context: 'GoogleCloudLoggingService',
                      executionId,
                      requestUserId,
                    }),
                  );
                }
                logRequest(statusCode);
                CloudLoggingAsyncNamespace.exit(ctx);
              },
              complete: () => {
                logRequest(200);
                CloudLoggingAsyncNamespace.exit(ctx);
              },
            }),
          );
        },
      });
    }
    console.log(
      JSON.stringify({
        severity: 'NOTICE',
        message: `Using GoogleCloudLoggingService as nest logger, enabled log levels: ${levels.join(
          ', ',
        )}`,
        context: 'GoogleCloudLoggingService',
      }),
    );
  }
  _log(
    level: 'INFO' | 'ERROR' | 'WARNING' | 'NOTICE' | 'DEBUG',
    context: string,
    message: any,
    trace?: string,
  ) {
    if (context === 'RoutesResolver' || context === 'RouterExplorer') {
      // Disable logs from nest route setup
      return;
    }
    if (message instanceof Error) {
      trace = trace ?? message.stack;
      message = String(message);
    }
    const extra = typeof message === 'string' ? undefined : message;
    if (typeof message !== 'string') {
      message = message.message ?? message.log ?? safeJsonStringify(message);
      if (typeof trace !== 'string' && typeof extra.trace === 'string') {
        trace = extra.trace;
        delete extra.trace;
      }
    }
    console.log(
      JSON.stringify({
        severity: level,
        message: `[${context}] ${message}`,
        stack: trace,
        'logging.googleapis.com/trace': CloudLoggingAsyncNamespace.get('trace'),
        context: context,
        requestId: CloudLoggingAsyncNamespace.get('requestId'),
        executionId: CloudLoggingAsyncNamespace.get('executionId'),
        extra,
      }),
    );
  }
  log(message: any, context?: string) {
    this._log('INFO', context ?? defaultContext, message);
  }
  error(message: any, trace?: string, context?: string) {
    if (!context) {
      context = trace ?? defaultContext;
      trace = undefined;
    }
    this._log('ERROR', context ?? defaultContext, message, trace);
  }
  warn(message: any, context?: string) {
    this._log('WARNING', context ?? defaultContext, message);
  }

  debug(message: any, context?: string) {
    this._log('DEBUG', context ?? defaultContext, message);
  }
  verbose(message: any, context?: string) {
    this._log('NOTICE', context ?? defaultContext, message);
  }
}
