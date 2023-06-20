import {
  Comment,
  CommentVote,
  Post,
  Subreddit,
  Subscription,
  User,
  Vote,
} from "@prisma/client";

export type ExtendedPost = Post & {
  Subreddit: Subreddit;
  votes: Vote[];
  author: User;
  comments: Comment[];
};

export type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};
export type ExtendedSubreddit = Subreddit & {
  subscribers: (Subscription & {
    user: User;
  })[];
};
