import { Inject, Logger } from '@nestjs/common';
import WebSocket from 'ws';

import {
  RawTransaction,
  WebSocketWatcherService,
} from './websocket-watcher.interface';
import { WebSocketWatcherRepository } from './websocket-watcher.repository';

const WEBSOCKET_RECONNECT = 100;
const MARKET_WS_URL = process.env.MARKET_WS_URL
  ? process.env.MARKET_WS_URL
  : 'ws://35.241.105.108/stream';

export class DefaultWebSocketWatcherService implements WebSocketWatcherService {
  private logger = new Logger(DefaultWebSocketWatcherService.name);
  private client: undefined | WebSocket;
  private closed: boolean;
  private readonly endpoint = MARKET_WS_URL;
  onError: (error: Error) => void;
  onReconnect: () => void;

  constructor(
    @Inject(WebSocketWatcherRepository)
    private readonly webSocketWatcherRepository: WebSocketWatcherRepository,
  ) {
    this.closed = true;
    this.onError = console.error;
    this.onReconnect = () => {
      void 0;
    };
  }

  async startWebSocketWatching() {
    this.logger.verbose(`[WebSocket] Starting websocket watching`);

    if (this.client !== undefined) {
      return;
    }

    this.logger.debug(`[WebSocket] connecting wss to ${this.endpoint}`);
    this.client = new WebSocket(this.endpoint);

    this.closed = false;

    this.client.onopen = () => {
      this.logger.debug(`[WebSocket] connected to ${this.endpoint}`);
    };

    this.client.onerror = async (event: { error: Error }) => {
      this.onError(event.error);
      await new Promise(f => setTimeout(f, WEBSOCKET_RECONNECT));
      await this.restartUnexpectedClosedWebsocket();
    };

    this.client.onmessage = async (event: { data: any }) => {
      const msg = String(event.data);

      try {
        const m = JSON.parse(msg);

        await this.webSocketWatcherRepository.insertInitialValidationTime({
          ts: m.ts,
          ticker: m.ticker,
        });
        // TODO : Validate input
        await this.insertTransactionToDB({
          ts: m.ts,
          ticker: m.ticker,
          quantity: m.quantity,
          price: m.price,
          tradeid: m.tradeid,
        });
      } catch (e) {
        this.onError(e as Error);
      }
    };

    this.client.onclose = async () => {
      if (!this.closed) {
        this.client = undefined;

        console.error(
          `[WebSocket] Connection closed unexpectedly or because of timeout. Reconnecting after ${WEBSOCKET_RECONNECT}ms.`,
        );

        await new Promise(f => setTimeout(f, WEBSOCKET_RECONNECT));
        await this.restartUnexpectedClosedWebsocket();
      } else {
        console.info(
          '[WebSocket] The connection has been closed successfully.',
        );
      }
    };
  }

  private async restartUnexpectedClosedWebsocket() {
    if (this.closed) {
      return;
    }

    await this.startWebSocketWatching();

    if (this.client === undefined) {
      console.error(
        "[WebSocket] Couldn't reconnect to websocket. Error callback is called.",
      );
      return;
    }

    this.onReconnect();
  }

  async insertTransactionToDB({
    ts,
    ticker,
    quantity,
    price,
    tradeid,
  }: RawTransaction): Promise<void> {
    await this.webSocketWatcherRepository.insertTransaction({
      ts,
      ticker,
      quantity,
      price,
      tradeid,
    });
    return;
  }
}

export const WebSocketWatcherProvider = {
  provide: WebSocketWatcherService,
  useClass: DefaultWebSocketWatcherService,
};

export default WebSocketWatcherProvider;
