import { FC } from "react";
import Link from "next/link";
import { Subreddit, Subscription, User } from "@prisma/client";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/ui/Button";
import { Users } from "lucide-react";

type TrendingSubredditType = Subreddit & {
  subscribers: Subscription[];
  Creator: User | null;
};

interface TrendingPostsProps {
  subreddits: TrendingSubredditType[];
}

const TrendingPosts: FC<TrendingPostsProps> = ({ subreddits }) => {
  return (
    <div className="flex flex-col gap-y-2 pb-2">
      {subreddits.map((subreddit) => (
        <Link
          key={subreddit.id}
          href={`/r/${subreddit.name}`}
          className={cn(
            buttonVariants({ variant: "subtle" }),
            "w-full flex justify-between"
          )}
        >
          <span className="text-zinc-800 text-sm w-full truncate">
            {subreddit.name}
          </span>
          <div className="flex justify-end gap-x-2 text-zinc-500 items-center">
            <span className="text-sm">{subreddit.subscribers.length}</span>
            <Users className="h-4 w-4" />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TrendingPosts;
