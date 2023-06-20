import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function DELETE() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("UNAUTHORIZED", { status: 401 });
    }

    await db.user.delete({
      where: {
        id: session.user.id,
      },
    });

    return new Response("OK");
  } catch (error) {
    return new Response("Something went wrong", { status: 500 });
  }
}
