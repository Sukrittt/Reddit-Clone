import { z } from "zod";

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  let followedCommunityIds: string[] = [];

  if (session) {
    const followedCommunites = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subreddit: true,
      },
    });

    followedCommunityIds = followedCommunites.map(
      ({ subreddit }) => subreddit.id
    );
  }

  try {
    const { limit, page, subredditName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subredditName: z.string().nullish().optional(),
      })
      .parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
        subredditName: url.searchParams.get("subredditName"),
      });

    let whereClause = {};

    if (subredditName) {
      whereClause = {
        Subreddit: {
          name: subredditName,
        },
      };
    } else if (session) {
      whereClause = {
        Subreddit: {
          id: {
            in: followedCommunityIds,
          },
        },
      };
    }

    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Subreddit: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    });

    return new Response(JSON.stringify(posts));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed.", { status: 422 });
    }

    return new Response("Could not fetch posts. Please try again later.", {
      status: 500,
    });
  }
}