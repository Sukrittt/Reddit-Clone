import { FC } from "react";
import { User } from "@prisma/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/Card";
import SubredditSheet from "@/components/settings/SubredditSheet";
import { ExtendedSubreddit } from "@/types/db";

interface UserSubredditListProps {
  subreddits: ExtendedSubreddit[];
  user: Pick<User, "id">;
}

const UserSubredditList: FC<UserSubredditListProps> = ({
  subreddits,
  user,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subreddits</CardTitle>
        <CardDescription>
          Manage your subreddits and their settings.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {subreddits.map((subreddit) => (
          <SubredditSheet
            key={subreddit.id}
            subreddit={subreddit}
            user={user}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default UserSubredditList;
