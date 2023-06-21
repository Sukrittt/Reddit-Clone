import { z } from "zod";

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { subredditDeletePayload } from "@/lib/validators/subreddit";

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const uuid = url.searchParams.get("userId");
    const subId = url.searchParams.get("subredditId");

    const body = { userId: uuid, subredditId: subId };

    const { userId, subredditId } = subredditDeletePayload.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const existingUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return new Response("User not found", { status: 404 });
    }

    const existingSubreddit = await db.subreddit.findFirst({
      where: {
        id: subredditId,
      },
    });

    if (!existingSubreddit) {
      return new Response("Subreddit not found", { status: 404 });
    }

    await db.subscription.delete({
      where: {
        userId_subredditId: {
          userId,
          subredditId,
        },
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed.", { status: 422 });
    }

    return new Response(
      "Could not remove user from subreddit. Please try again later.",
      {
        status: 500,
      }
    );
  }
}
