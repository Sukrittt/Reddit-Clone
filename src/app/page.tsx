import Link from "next/link";
import { HomeIcon, TrendingUp } from "lucide-react";

import { buttonVariants } from "@/ui/Button";
import { getAuthSession } from "@/lib/auth";

import { CustomFeed, GeneralFeed } from "@/components/HomeFeed";
import { db } from "@/lib/db";
import TrendingPosts from "@/components/post/TrendingPosts";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const session = await getAuthSession();
  const trendingPosts = await db.subreddit.findMany({
    take: 3,
    orderBy: {
      subscribers: {
        _count: "desc",
      },
    },
    include: {
      Creator: true,
      subscribers: true,
    },
  });

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl">Your feed</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
        {/* @ts-expect-error Server Component */}
        {session ? <CustomFeed /> : <GeneralFeed />}
        <div className="flex flex-col gap-y-4 order-first md:order-last">
          <div className="overflow-hidden h-fit rounded-lg border border-gray-200">
            <div className="bg-emerald-100 px-6 py-4">
              <p className="font-semibold py-3 flex items-center gap-1.5">
                <HomeIcon className="h-4 w-4" />
                Home
              </p>
            </div>
            <div className="-my-3 divide-y divide-gray-100 text-sm px-6 py-4 leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <p className="text-zinc-500">
                  Your personal Breddit homepage. Come here to check in with
                  your favourite communites.
                </p>
              </div>
              <Link
                href="/r/create"
                className={buttonVariants({ className: "w-full mt-4 mb-6" })}
              >
                Create Community
              </Link>
            </div>
          </div>

          <div className="overflow-hidden h-fit rounded-lg border border-gray-200">
            <div className="bg-yellow-100 px-6 py-4">
              <p className="font-semibold py-3 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Communities
              </p>
            </div>
            <div className="-my-3 divide-y divide-gray-100 text-sm px-6 py-4 leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <p className="text-zinc-500">
                  Top communites you might be interested in.
                </p>
              </div>
              <TrendingPosts subreddits={trendingPosts} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
