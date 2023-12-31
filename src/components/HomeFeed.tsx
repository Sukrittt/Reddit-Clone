import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import PostFeed from "./post/PostFeed";
import { getAuthSession } from "@/lib/auth";

export const GeneralFeed = async () => {
  const posts = await db.post.findMany({
    orderBy: [
      {
        comments: {
          _count: "desc",
        },
      },
      {
        createdAt: "desc",
      },
    ],
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

export const CustomFeed = async () => {
  const session = await getAuthSession();

  if (!session) return notFound();

  const posts = await db.post.findMany({
    orderBy: [
      {
        comments: {
          _count: "desc",
        },
      },
      {
        createdAt: "desc",
      },
    ],
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
