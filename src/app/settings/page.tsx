import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { authOptions, getAuthSession } from "@/lib/auth";
import UserNameForm from "@/components/User/UserNameForm";
import UserSubredditList from "@/components/User/UserSubredditList";
import UserDeletion from "@/components/User/UserDeletion";

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const page = async () => {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(authOptions.pages?.signIn || "/sign-in");
  }

  const subreddits = await db.subreddit.findMany({
    where: {
      creatorId: session.user.id,
    },
    include: {
      subscribers: {
        include: {
          user: true,
        },
      },
    },
  });

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-4">
      <h1 className="font-bold text-3xl md:text-4xl">Settings</h1>

      <UserNameForm
        user={{
          id: session.user.id,
          username: session.user.username || "",
        }}
      />

      {subreddits.length > 0 && (
        <UserSubredditList
          subreddits={subreddits}
          user={{ id: session.user.id }}
        />
      )}

      <UserDeletion
        user={{
          username: session.user.username || "",
        }}
      />
    </div>
  );
};

export default page;
