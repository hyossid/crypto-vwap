import { Inject, Logger } from '@nestjs/common';
import WebSocket from 'ws';

import { RedisClientType, createClient } from 'redis';
import {
  RawTransaction,
  WebSocketWatcherService,
} from './websocket-watcher.interface';
import { WebSocketWatcherRepository } from './websocket-watcher.repository';

const kReconnectWaitMs = 100;
const MARKET_WS_URL = 'ws://35.241.105.108/stream';
const REDIS_PORT = 61792;
const REDIS_HOST = 'localhost';

export class DefaultWebSocketWatcherService implements WebSocketWatcherService {
  private logger = new Logger(DefaultWebSocketWatcherService.name);
  private client: undefined | WebSocket;
  private redisClient: undefined | RedisClientType;
  private closed: boolean;
  private readonly endpoint = MARKET_WS_URL;
  //private isFirst: boolean;
  onError: (error: Error) => void;
  onReconnect: () => void;

  constructor(
    @Inject(WebSocketWatcherRepository)
    private readonly webSocketWatcherRepository: WebSocketWatcherRepository, // typedEnv('ETH_NODE_WS_URL') //   .optional() //   .toString(),
  ) {
    this.closed = true;
    //  this.isFirst = true;
    this.onError = console.error;
    this.onReconnect = () => {
      void 0;
    };
  }

  async startWebSocketWatching() {
    this.logger.verbose(`Starting websocket watching`);
    // TODO : Initial setting if needed
    if (this.client !== undefined) {
      return;
    }
    if (this.redisClient !== undefined) {
      return;
    }

    if (this.endpoint == null) {
      this.logger.warn('ETH_NODE_WS_URL is not set');
      return;
    }

    this.logger.debug(`connecting wss to ${this.endpoint}`);
    this.client = new WebSocket(this.endpoint);
    this.redisClient = createClient({
      url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    });
    this.closed = false;

    this.client.onopen = () => {
      this.logger.debug(`connected to ${this.endpoint}`);
      //this.startSubscriptionsIfNecessary();
    };

    this.client.onerror = (event: { error: Error }) => {
      this.onError(event.error);
    };
    this.redisClient.on('error', err => console.log('Redis Client Error', err));

    await this.redisClient.connect();

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

        // TODO : Parallelize
        // await this.insertTransationToBuffer({
        //   ts: m.ts,
        //   ticker: m.ticker,
        //   quantity: m.quantity,
        //   price: m.price,
        //   tradeid: m.tradeid,
        // });
      } catch (e) {
        this.onError(e as Error);
      }
    };

    this.client.onclose = async () => {
      if (!this.closed) {
        this.client = undefined;

        console.error(
          `Connection closed unexpectedly or because of timeout. Reconnecting after ${kReconnectWaitMs}ms.`,
        );

        await new Promise(f => setTimeout(f, kReconnectWaitMs));
        await this.restartUnexpectedClosedWebsocket();
      } else {
        console.info('The connection has been closed successfully.');
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
        "Couldn't reconnect to websocket. Error callback is called.",
      );
      return;
    }

    this.onReconnect();
  }

  // async insertTransationToBuffer({
  //   ts,
  //   ticker,
  //   quantity,
  //   price,
  //   tradeid,
  // }: RawTransaction): Promise<void> {
  //   if (this.redisClient === undefined) {
  //     console.error("Couldn't reconnect to redis. Error callback is called.");
  //     return;
  //   }
  //   const serializedObject = JSON.stringify({
  //     ts,
  //     ticker,
  //     quantity,
  //     price,
  //     tradeid,
  //   });

  //   // Assume no outliers join the buffer
  //   if (ts < Date.now() - BUFFER_LIFETIME * 1000) return;
  //   await this.redisClient.ZADD(REDIS_DATA_KEY, {
  //     score: ts,
  //     value: serializedObject,
  //   });

  //   return;
  // }

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
