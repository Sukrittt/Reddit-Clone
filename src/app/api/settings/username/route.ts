import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserNameValidator } from "@/lib/validators/username";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const session = await getAuthSession();

    const { name: username } = UserNameValidator.parse(body);

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const existingUserName = await db.user.findFirst({
      where: {
        username,
      },
    });

    if (existingUserName) {
      return new Response("Username already exists", { status: 409 });
    }

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username,
      },
    });

    return new Response(username);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Something went wrong", { status: 500 });
  }
}
