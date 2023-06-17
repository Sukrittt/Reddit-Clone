"use client";
import { FC, startTransition } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import { Button } from "@/ui/Button";
import { useAuthToast } from "@/hooks/useAuthToast";
import { toast } from "@/hooks/use-toast";
import type { SubredditSubscriptionPayload } from "@/lib/validators/subreddit";

interface SubscriptionToggleProps {
  subredditId: string;
  subredditName: string;
  isSubscribed: boolean;
}

const SubscriptionToggle: FC<SubscriptionToggleProps> = ({
  subredditId,
  subredditName,
  isSubscribed,
}) => {
  const { loginToast } = useAuthToast();
  const router = useRouter();

  //subscribe
  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubredditSubscriptionPayload = {
        subredditId,
      };

      const { data } = await axios.post("/api/subreddit/subscribe", payload);
      return data as string;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const responseStatus = error.response?.status;

        if (responseStatus === 401) {
          return loginToast();
        }
      }

      toast({
        title: "There was an error.",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      toast({
        title: "Subscribed",
        description: `You are now subscribed to r/${subredditName}`,
      });
    },
  });

  //unsubscribe
  const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubredditSubscriptionPayload = {
        subredditId,
      };

      const { data } = await axios.post("/api/subreddit/unsubscribe", payload);
      return data as string;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const responseStatus = error.response?.status;

        if (responseStatus === 401) {
          return loginToast();
        }
      }

      toast({
        title: "There was an error.",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      toast({
        title: "Unsubscribed",
        description: `You are now unsubscribed from r/${subredditName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button
      className="w-full mt-1 mb-4"
      onClick={() => unsubscribe()}
      isLoading={isUnsubLoading}
    >
      Leave community
    </Button>
  ) : (
    <Button
      className="w-full mt-1 mb-4"
      onClick={() => subscribe()}
      isLoading={isSubLoading}
    >
      Join to post
    </Button>
  );
};

export default SubscriptionToggle;
