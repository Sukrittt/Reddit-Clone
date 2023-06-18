import { db } from "@/lib/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import PostFeed from "./PostFeed";
import { Session } from "next-auth";

export const GeneralFeed = async () => {
  const posts = await db.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      Subreddit: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  });

  return <PostFeed initialPosts={posts} />;
};

export const CustomFeed = async (props: { session: Session }) => {
  const { session } = props;

  const followedCommunities = await db.subscription.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      subreddit: true,
    },
  });

  const posts = await db.post.findMany({
    where: {
      Subreddit: {
        name: {
          in: followedCommunities.map(({ subreddit }) => subreddit.name),
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: true,
      comments: true,
      votes: true,
      Subreddit: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  });

  return <PostFeed initialPosts={posts} />;
};
