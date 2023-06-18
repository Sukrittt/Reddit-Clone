import { notFound } from "next/navigation";

import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";

import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

interface PageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { slug } = params;
  const name = decodeURIComponent(slug);

  const session = await getAuthSession();

  const subreddit = await db.subreddit.findFirst({
    where: {
      name,
    },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          Subreddit: true,
        },
        orderBy: {
          createdAt: "desc",
        },

        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
      },
    },
  });

  if (!subreddit) return notFound();

  return (
    <>
      <h1 className="font-bold texr-3xl md:text-4xl h-14">
        r/{subreddit.name}
      </h1>
      <MiniCreatePost session={session} />
      <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} />
    </>
  );
};

export default page;
