"use client";
import { FC, useState } from "react";
import { CommentVote, VoteType } from "@prisma/client";
import { usePrevious } from "@mantine/hooks";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/Button";
import { toast } from "@/hooks/use-toast";
import { useAuthToast } from "@/hooks/useAuthToast";
import type { CommentVoteType } from "@/lib/validators/vote";

type PartialVote = Pick<CommentVote, "type">;

interface CommentVoteProps {
  commentId: string;
  initialVoteAmt: number;
  initialVote?: PartialVote;
}

const CommentVote: FC<CommentVoteProps> = ({
  commentId,
  initialVoteAmt,
  initialVote,
}) => {
  const { loginToast } = useAuthToast();

  const [votesAmt, setVotesAmt] = useState<number>(initialVoteAmt);
  const [currentVote, setCurrentVote] = useState<PartialVote | undefined>(
    initialVote
  );

  const previousVote = usePrevious(currentVote);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteType = {
        commentId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/comment/vote", payload);
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
        if (err instanceof AxiosError) {
          const responseStatus = err.response?.status;

          if (responseStatus === 401) {
            return loginToast();
          }
        }
      }

      return toast({
        title: "Something went wrong.",
        description: "Your vote was not registerd. Please try again.",
        variant: "destructive",
      });
    },
    onMutate: (type: VoteType) => {
      if (currentVote?.type === type) {
        setCurrentVote(undefined);

        if (type === "UP") {
          setVotesAmt((prev) => prev - 1);
        } else if (type === "DOWN") {
          setVotesAmt((prev) => prev + 1);
        }
      } else {
        setCurrentVote({ type });

        if (type === "DOWN") {
          setVotesAmt((prev) => prev - (currentVote ? 2 : 1));
        } else if (type === "UP") {
          setVotesAmt((prev) => prev + (currentVote ? 2 : 1));
        }
      }
    },
  });

  return (
    <div className="flex gap-1">
      <Button
        onClick={() => vote("UP")}
        size="sm"
        variant="ghost"
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote?.type === "UP",
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
            "text-red-500 fill-red-500": currentVote?.type === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentVote;
