import { Inject, Logger } from '@nestjs/common';
import WebSocket from 'ws';

import {
  RawTransaction,
  WebSocketWatcherService,
} from './websocket-watcher.interface';
import { WebSocketWatcherRepository } from './websocket-watcher.repository';

const kReconnectWaitMs = 100;
const MARKET_WS_URL = 'ws://35.241.105.108/stream';
export class DefaultWebSocketWatcherService implements WebSocketWatcherService {
  private logger = new Logger(DefaultWebSocketWatcherService.name);
  private client: undefined | WebSocket;
  private closed: boolean;
  private readonly endpoint = MARKET_WS_URL;

  onError: (error: Error) => void;
  onReconnect: () => void;

  constructor(
    @Inject(WebSocketWatcherRepository)
    private readonly webSocketWatcherRepository: WebSocketWatcherRepository, // typedEnv('ETH_NODE_WS_URL') //   .optional() //   .toString(),
  ) {
    this.closed = true;
    this.onError = console.error;
    this.onReconnect = () => {
      void 0;
    };
  }

  // private startSubscriptionsIfNecessary() {
  //   for (const processName in this.syncProcesses) {
  //     let processSubscription = this.syncProcessesSubscription[processName];
  //     const process = this.syncProcesses[processName];
  //     assert(process, `Process ${processName} not found`);
  //     if (processSubscription == null) {
  //       processSubscription = { logs: {} };
  //       this.syncProcessesSubscription[processName] = processSubscription;
  //     }

  //     if (processSubscription.logs.requestId == null) {
  //       this.subscribeProcess(process, processSubscription);
  //     }
  //   }
  // }

  async startWebSocketWatching() {
    this.logger.verbose(`Starting websocket watching`);
    // TODO : Initial setting if needed

    if (this.client !== undefined) {
      return;
    }

    if (this.endpoint == null) {
      this.logger.warn('ETH_NODE_WS_URL is not set');
      return;
    }

    this.logger.debug(`connecting wss to ${this.endpoint}`);
    this.client = new WebSocket(this.endpoint);
    this.closed = false;

    this.client.onopen = () => {
      this.logger.debug(`connected to ${this.endpoint}`);
      //this.startSubscriptionsIfNecessary();
    };

    this.client.onerror = (event: { error: Error }) => {
      this.onError(event.error);
    };

    this.client.onmessage = async (event: { data: any }) => {
      const msg = String(event.data);
      try {
        const m = JSON.parse(msg);
        console.log(m);

        // Validate input
        await this.insertTransaction({
          ts: m.ts,
          ticker: m.ticker,
          quantity: m.quantity,
          price: m.price,
          tradeid: m.tradeid,
        });
        // if (m.id != null) {
        //   this.receiveResponse(m.id, m);
        // } else if (m.method === 'eth_subscription' && m.params != null) {
        //   const params = m.params;
        //   const subscriptionId = params.subscription;
        //   const result = params.result;
        //   if (subscriptionId != null && result != null) {
        //     const processSubscriptionId =
        //       this.syncProcessesSubscriptionId[subscriptionId];
        //     if (processSubscriptionId != null) {
        //       const process =
        //         this.syncProcesses[processSubscriptionId.processName];
        //       if (process != null) {
        //         process.onEvent(processSubscriptionId.subscriptionType, result);
        //       }
        //     }
        //   }
        // }
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

    // for (;;) {
    //   for (const address of addresses) {
    //     await this.fetchAndSaveTxsOnStacks(address);
    //   }

    //   await this.chainWatcherRepository.u0_processIncomingTxsOnStacks();
    //   await this.chainWatcherRepository.w4_processTokensoftBridgeTxOnStacks();
    //   await this.chainWatcherRepository.w5_processSendToUserTxOnStacks();

    //   if (options.once) {
    //     break;
    //   }
    //   await sleep(10000);
    // }
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

  async insertTransaction({
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
