"use client";
import { FC, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { CommentVote as CommentVoteType } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";

import { Label } from "@/ui/Label";
import { Button } from "@/ui/Button";
import { Textarea } from "@/ui/Textarea";
import { toast } from "@/hooks/use-toast";
import { ExtendedComment } from "@/types/db";
import { formatTimeToNow } from "@/lib/utils";
import UserAvatar from "@/components/User/UserAvatar";
import { useAuthToast } from "@/hooks/useAuthToast";
import CommentVote from "@/components/post-vote/CommentVote";
import type { CommentValidatorType } from "@/lib/validators/comment";

interface PostCommentProps {
  comment: ExtendedComment;
  initialVote: CommentVoteType | undefined;
  initialVoteAmt: number;
  postId: string;
}

const PostComment: FC<PostCommentProps> = ({
  comment,
  initialVote,
  initialVoteAmt,
  postId,
}) => {
  const router = useRouter();
  const commentRef = useRef<HTMLDivElement>(null);
  const { loginToast } = useAuthToast();

  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  const { data: session } = useSession();

  const { mutate: reply, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentValidatorType) => {
      const payload: CommentValidatorType = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch(
        "/api/subreddit/post/comment",
        payload
      );
      return data;
    },
    onError: (err) => {
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
    onSuccess: () => {
      router.refresh();
      setInput("");
      setIsReplying(false);
    },
  });

  const handleReply = () => {
    if (!session) {
      return router.push("/sign-in");
    }
    setIsReplying((prev) => !prev);
  };

  return (
    <div className="flex flex-col" ref={commentRef}>
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className="h-6 w-6"
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      <div className="flex flex-wrap gap-4 mt-2 items-center">
        <CommentVote
          commentId={comment.id}
          initialVoteAmt={initialVoteAmt}
          initialVote={initialVote}
        />

        <Button onClick={handleReply} variant="ghost" size="xs">
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>

        {isReplying && (
          <div className="grid w-full gap-1.5">
            <Label htmlFor="comment">Your comment</Label>
            <div className="mt-2">
              <Textarea
                id="comment"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="What are your thoughts?"
              />
              <div className="mt-2 flex justify-end gap-x-2">
                <Button
                  tabIndex={input.length === 0 ? undefined : 1}
                  variant="subtle"
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    reply({
                      postId,
                      text: input,
                      replyToId: comment.replyToId ?? comment.id,
                    })
                  }
                  disabled={input.length === 0}
                  isLoading={isLoading}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostComment;

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

export const CreateComment: FC<CreateCommentProps> = ({
  postId,
  replyToId,
}) => {
  const [input, setInput] = useState<string>("");

  const { loginToast } = useAuthToast();
  const router = useRouter();

  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async ({ text, postId, replyToId }: CommentValidatorType) => {
      const payload: CommentValidatorType = {
        text,
        postId,
        replyToId,
      };

      const { data } = await axios.patch(
        "/api/subreddit/post/comment",
        payload
      );
      return data;
    },
    onError: (err) => {
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
    onSuccess: () => {
      router.refresh();
      setInput("");
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Your comment</Label>
      <div className="mt-2">
        <Textarea
          id="comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder="What are your thoughts?"
        />
        <div className="mt-2 flex justify-end">
          <Button
            onClick={() => comment({ postId, text: input, replyToId })}
            disabled={input.length === 0}
            isLoading={isLoading}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};
