import { createServer } from 'http';
import { getRaidTweetChClient } from 'gbs-open-lib/server';
import { getSubscriberCount, sendRaidTweetMini, wss } from './wss';
import { env } from './config';
import { parse } from 'node:url';

const server = createServer();
server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});
server.on('request', (req, res) => {
  try {
    const url = parse(req.url!);
    const pathname = url.pathname;
    if (pathname === '/count') {
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json;charset=utf-8');
      return res.end(JSON.stringify({ count: wss.clients.size }));
    } else if (pathname === '/filters') {
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json;charset=utf-8');
      return res.end(JSON.stringify(getSubscriberCount()));
    }
  } catch {}

  // それ以外はリダイレクト
  res.statusCode = 302;
  res.setHeader('location', 'https://gbs.eriri.net/');
  return res.end();
});

export async function main() {
  const subRedis = getRaidTweetChClient();
  subRedis.on('tweet', (tweet) => {
    sendRaidTweetMini(tweet);
  });

  server.listen(env.SERVER_PORT).on('listening', () => {
    console.log('🚀 listening...', ':' + env.SERVER_PORT);
  });
}

main();
