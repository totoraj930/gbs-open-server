import { RaidTweetMini } from 'gbs-open-lib';
import { WebSocket, WebSocketServer } from 'ws';
import { ServerMessage, zClientMessage } from './schema';

export const wss = new WebSocketServer({ noServer: true });

const subscriber: Map<number, Set<WebSocket>> = new Map();

export function getSubscriberCount() {
  return [...subscriber.entries()]
    .sort((a, b) => a[0] - b[0])
    .map((item) => {
      return {
        id: item[0],
        count: item[1].size,
      };
    });
}

wss.on('connection', (ws, req) => {
  if (req.headers.referer) {
    console.log(req.headers.referer);
  }

  ws.on('error', () => {});

  ws.on('message', (data) => {
    try {
      const json = JSON.parse(data.toString('utf-8'));
      const msg = zClientMessage.parse(json);
      switch (msg.type) {
        case 'filters': {
          // 一旦全ての購読を解除
          for (const clients of subscriber.values()) {
            clients.delete(ws);
          }
          for (const id of msg.data) {
            let clients = subscriber.get(id);
            if (!clients) {
              clients = new Set();
              subscriber.set(id, clients);
            }
            clients.add(ws);
          }
        }
      }
    } catch {
      sendError(ws, '無効なリクエストです');
    }
  });
});

export function sendAll(serverMsg: ServerMessage) {
  const msg = JSON.stringify(serverMsg);
  try {
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
