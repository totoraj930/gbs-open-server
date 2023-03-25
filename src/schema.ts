import { zRaidTweetMini } from 'gbs-open-lib';
import { z } from 'zod';

export const zFiltersMessage = z.object({
  type: z.literal('filters'),
  data: z.array(z.number().min(-1).max(250)).max(20),
});
export const zAuthMessage = z.object({
  type: z.literal('auth'),
  token: z.string(),
});
export const zClientMessage = z.union([zFiltersMessage, zAuthMessage]);

export const zTimeMessage = z.object({
  type: z.literal('time'),
  data: z.number(),
});
export const zTweetMessage = z.object({
  type: z.literal('t'),
  data: zRaidTweetMini,
});
export const zErrorMessage = z.object({
  type: z.literal('error'),
  message: z.string(),
});
export const zSimpleMessage = z.object({
  type: z.literal('message'),
  message: z.string(),
});
export const zUpdateGbsListMessage = z.object({
  type: z.literal('updateGbsList'),
});
export const zUpdateInfoMessage = z.object({
  type: z.literal('updateInfo'),
});
export const zServerMessage = z.union([
  zTimeMessage,
  zTweetMessage,
  zErrorMessage,
  zSimpleMessage,
  zUpdateGbsListMessage,
  zUpdateInfoMessage,
]);

export type ServerMessage = z.infer<typeof zServerMessage>;
