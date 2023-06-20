"use client";
import { FC, useEffect, useState } from "react";
import { VoteType } from "@prisma/client";
import { usePrevious } from "@mantine/hooks";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { PostVoteType } from "@/lib/validators/vote";
import { useAuthToast } from "@/hooks/useAuthToast";
import { Button } from "@/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface PostVoteClientProps {
  postId: string;
  initialVoteAmt: number;
  initialVote?: VoteType | null;
}

const PostVoteClient: FC<PostVoteClientProps> = ({
  postId,
  initialVoteAmt,
  initialVote,
}) => {
  const { loginToast } = useAuthToast();

  const [votesAmt, setVotesAmt] = useState<number>(initialVoteAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);

  const previousVote = usePrevious(currentVote);

  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteType = {
        postId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/vote", payload);
    },
    onError: (err, voteType) => {
      if (voteType === "UP") {
        setVotesAmt((prev) => prev - 1);
      } else {
        setVotesAmt((prev) => prev + 1);
      }

      //reset current vote
      setCurrentVote(previousVote);

      if (err instanceof AxiosError) {
        const responseStatus = err.response?.status;

        if (responseStatus === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Something went wrong.",
        description: "Your vote was not registerd. Please try again.",
        variant: "destructive",
      });
    },
    onMutate: (voteType: VoteType) => {
      if (currentVote === voteType) {
        setCurrentVote(undefined);

        if (voteType === "UP") {
          setVotesAmt((prev) => prev - 1);
        } else if (voteType === "DOWN") {
          setVotesAmt((prev) => prev + 1);
        }
      } else {
        setCurrentVote(voteType);

        if (voteType === "DOWN") {
          setVotesAmt((prev) => prev - (currentVote ? 2 : 1));
        } else if (voteType === "UP") {
          setVotesAmt((prev) => prev + (currentVote ? 2 : 1));
        }
      }
    },
  });

  return (
    <div className="flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0">
      <Button
        onClick={() => vote("UP")}
        size="sm"
        variant="ghost"
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>
      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmt}
      </p>

      <Button
        onClick={() => vote("DOWN")}
        size="sm"
        variant="ghost"
        aria-label="downvote"
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
