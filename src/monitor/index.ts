import { env } from '@/config';
import axios from 'axios';
import { createServer } from 'http';
import { parse } from 'node:url';
import { z } from 'zod';

const server = createServer();

const serverList = [
  'http://localhost:10510',
  'http://localhost:10511',
  'http://localhost:10512',
  'http://localhost:10513',

  'http://153.126.171.163:10510',
  'http://153.126.171.163:10511',
  'http://153.126.171.163:10512',
  // 'http://153.126.171.163:10513',
];

server.on('request', async (req, res) => {
  try {
    const url = parse(req.url!);
    const pathname = url.pathname;
    if (pathname === '/') {
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json;charset=utf-8');
      return res.end(JSON.stringify(await getAllCount(), null, '  '));
    } else if (pathname === '/filters') {
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json;charset=utf-8');
      return res.end(JSON.stringify(await getAllFilters()));
    }
  } catch {}
  res.statusCode = 500;
  res.end('Server Error');
});

server.listen(env.MONITOR_PORT).on('listening', () => {
  console.log(
    new Date().toLocaleString(),
    '🚀 monitor listening...',
    ':' + env.MONITOR_PORT
  );
});

const zCountResponse = z.object({
  count: z.number(),
});
async function getAllCount() {
  return await Promise.all(
    serverList.map(async (url) => {
      try {
        const { data } = await axios.get(`${url}/count`, { timeout: 2000 });
        return zCountResponse.parse(data).count;
      } catch {
        return -1;
      }
    })
  );
}

const zFiltersResponse = z.array(
  z.object({
    id: z.number(),
    count: z.number(),
  })
);
async function getAllFilters() {
  const resList = await Promise.all(
    serverList.map(async (url) => {
      try {
        const { data } = await axios.get(`${url}/filters`, { timeout: 2000 });
        return zFiltersResponse.parse(data);
      } catch {
        return [];
      }
    })
  );
  const countRecord: Map<number, number> = new Map();
  for (const res of resList) {
    for (const item of res) {
      const count = (countRecord.get(item.id) ?? 0) + item.count;
      countRecord.set(item.id, count);
    }
  }
  return [...countRecord].map((item) => ({ id: item[0], count: item[1] }));
}
