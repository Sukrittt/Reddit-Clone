import { z } from "zod";

export const SubredditValidator = z.object({
  name: z.string().min(3).max(21),
});

export const SubredditNameValidator = z.object({
  name: z.string().min(3).max(21),
  subredditId: z.string(),
});

export const SubredditSubscriptionValidator = z.object({
  subredditId: z.string(),
});

export type CreateSubredditPayload = z.infer<typeof SubredditValidator>;
export type SubredditSubscriptionPayload = z.infer<
  typeof SubredditSubscriptionValidator
>;
export type SubredditNamePayload = z.infer<typeof SubredditNameValidator>;
