import { RaidTweetMini } from 'gbs-open-lib';
import { WebSocket, WebSocketServer } from 'ws';
import { ServerMessage, zClientMessage } from './schema';
import { env } from './config';

export const wss = new WebSocketServer({ noServer: true });
const aliveFlag = new Map<WebSocket, boolean>();
/**
 * PingPong
 */
const interval = setInterval(() => {
  aliveFlag.forEach((flag, ws) => {
    if (!flag) {
      ws.terminate();
      aliveFlag.delete(ws);
      return;
    }
    aliveFlag.set(ws, false);
    ws.ping();
  });
}, 1000 * 10);

const subscriber: Map<number, Set<WebSocket>> = new Map();

export function getSubscriberCount() {
  return [...subscriber.entries()]
    .sort((a, b) => a[0] - b[0])
    .flatMap((item) => {
      if (item[1].size <= 0) return [];
      return [
        {
          id: item[0],
          count: item[1].size,
        },
      ];
    });
}

wss.on('connection', (ws, req) => {
  aliveFlag.set(ws, true);

  sendMessage(ws, {
    type: 'time',
    data: Date.now(),
  });

  sendMessage(ws, {
    type: 'message',
    message: `server_id: ${env.SERVER_PORT}`,
  });

  ws.on('error', () => {});

  ws.on('pong', () => {
    aliveFlag.set(ws, true);
  });
  ws.on('close', () => {
    aliveFlag.delete(ws);
    removeAllFilter(ws);
  });

  ws.on('message', (data) => {
    try {
      const json = JSON.parse(data.toString('utf-8'));
      const msg = zClientMessage.parse(json);
      switch (msg.type) {
        case 'filters': {
          console.log(msg.data);
          // 一旦全ての購読を解除
          removeAllFilter(ws);
          for (const id of msg.data) {
            let clients = subscriber.get(id);
            if (!clients) {
              clients = new Set();
              subscriber.set(id, clients);
            }
            clients.add(ws);
          }
          break;
        }
        case 'ping': {
          sendMessage(ws, { type: 'pong' });
          break;
        }
      }
    } catch {
      sendError(ws, '無効なリクエストです');
    }
  });
});

function removeAllFilter(ws: WebSocket) {
  for (const clients of subscriber.values()) {
    clients.delete(ws);
  }
}

export function sendAll(serverMsg: ServerMessage) {
  try {
    const msg = JSON.stringify(serverMsg);
    for (const ws of wss.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  } catch {}
}

export function sendRaidTweetMini(tweet: RaidTweetMini) {
  try {
    const clients = subscriber.get(tweet.ei);
    if (!clients) return;
    const json: ServerMessage = {
      type: 't',
      data: tweet,
    };
    const msg = JSON.stringify(json);
    for (const ws of clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  } catch {}
}

function sendError(ws: WebSocket, msg: string) {
  try {
    if (ws.readyState === WebSocket.OPEN) {
      const json: ServerMessage = {
        type: 'error',
        message: msg,
      };
      ws.send(JSON.stringify(json));
    }
  } catch {}
}

function sendMessage(ws: WebSocket, serverMsg: ServerMessage) {
  try {
    const msg = JSON.stringify(serverMsg);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  } catch {}
}
