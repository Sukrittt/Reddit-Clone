import { z } from "zod";

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import {
  SubredditNameValidator,
  subredditDeleteValidator,
} from "@/lib/validators/subreddit";

//delete subreddit
export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("UNAUTHORIZED", { status: 401 });
    }

    const url = new URL(req.url);
    const subID = url.searchParams.get("subredditId");
    const body = { subredditId: subID };

    const { subredditId } = subredditDeleteValidator.parse(body);

    const existingSubreddit = await db.subreddit.findFirst({
      where: {
        id: subredditId,
      },
    });

    if (!existingSubreddit) {
      return new Response("Subreddit does not exist.", { status: 404 });
    }

    const isSubredditOwner = await db.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: session.user.id,
      },
    });
    if (!isSubredditOwner) {
      return new Response(
        "Only the creator of this subreddit can delete this.",
        { status: 403 }
      );
    }

    await db.subreddit.delete({
      where: {
        id: subredditId,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed.", { status: 422 });
    }

    return new Response("Could not delete subreddit. Please try again later.", {
      status: 500,
    });
  }
}

//update subreddit name
export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("UNAUTHORIZED", { status: 401 });
    }

    const body = await req.json();
    const { name, subredditId } = SubredditNameValidator.parse(body);

    const isSubredditOwner = await db.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: session.user.id,
      },
    });

    if (!isSubredditOwner) {
      return new Response(
        "Only the creator of this subreddit can change this.",
        { status: 403 }
      );
    }

    const existingSubreddit = await db.subreddit.findFirst({
      where: {
        name,
      },
    });

    if (existingSubreddit) {
      return new Response("Subreddit with this name already exists.", {
        status: 409,
      });
    }

    await db.subreddit.update({
      where: {
        id: subredditId,
      },
      data: {
        name,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed.", { status: 422 });
    }

    return new Response("Could not change name. Please try again later.", {
      status: 500,
    });
  }
}
