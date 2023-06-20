import { z } from "zod";

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { CommentValidator } from "@/lib/validators/comment";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { postId, text, replyToId } = CommentValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("UNAUTHORIZED", { status: 401 });
    }

    const post = await db.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        Subreddit: true,
      },
    });

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId: post.Subreddit.id,
        userId: session.user.id,
      },
    });

    if (!subscriptionExists) {
      return new Response(
        "You have to be subscribed to this subreddit in order to comment.",
        { status: 400 }
      );
    }

    await db.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        replyToId,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed.", { status: 422 });
    }

    return new Response("Could not create comment. Please try again later.", {
      status: 500,
    });
  }
}
