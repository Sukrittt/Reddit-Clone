"use client";
import { FC, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Ban, Info, Loader2 } from "lucide-react";
import { User } from "@prisma/client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/Sheet";
import { Input } from "@/ui/Input";
import { Label } from "@/ui/Label";
import { Button, buttonVariants } from "@/ui/Button";
import { cn } from "@/lib/utils";
import { ExtendedSubreddit } from "@/types/db";
import { toast } from "@/hooks/use-toast";
import { useAuthToast } from "@/hooks/useAuthToast";
import { CustomToolTip } from "@/components/CustomToolTip";
import {
  SubredditNamePayload,
  subredditDeleteRequest,
} from "@/lib/validators/subreddit";
import CustomAlertDialog from "@/components/CustomAlertDialog";

interface SubredditSheetProps {
  subreddit: ExtendedSubreddit;
  user: Pick<User, "id">;
}

const SubredditSheet: FC<SubredditSheetProps> = ({ subreddit, user }) => {
  const { loginToast } = useAuthToast();
  const router = useRouter();

  const [subredditName, setSubredditName] = useState<string>(subreddit.name);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  //change subreddit name
  const { mutate: changeName, isLoading: nameLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubredditNamePayload = {
        name: subredditName,
        subredditId: subreddit.id,
      };

      const { data } = await axios.patch(
        "/api/settings/subredditName",
        payload
      );
      return data;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status;

        if (statusCode === 401) {
          return loginToast();
        } else if (statusCode === 403) {
          toast({
            title: "Forbidden",
            description: "You don't have permission to do that.",
          });
        }
      }
      toast({
        title: "An error occurred.",
        description: "Unable to change subreddit name.",
      });
    },
    onSuccess: () => {
      toast({
        description: "Subreddit name changed successfully.",
      });
      router.refresh();
    },
  });

  const { mutate: removeUser, isLoading: removeUserLoader } = useMutation({
    mutationFn: async ({ userId, subredditId }: subredditDeleteRequest) => {
      const { data } = await axios.delete(
        `/api/settings/subredditMember/remove?userId=${userId}&subredditId=${subredditId}`
      );
      return data;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status;

        if (statusCode === 401) {
          return loginToast();
        } else if (statusCode === 404) {
          toast({
            title: "Not Found",
            description: "Either the user or the subreddit does not exist.",
          });
        } else if (statusCode === 422) {
          toast({
            title: "Invalid Request",
            description: "Either the user or the subreddit does not exist.",
          });
        }
      }
      toast({
        title: "An error occurred.",
        description: "Unable to change subreddit name.",
      });
    },
    onSuccess: () => {
      toast({
        description: "User removed successfully",
      });
      setRemovingUserId(null);
      router.refresh();
    },
    onMutate: ({ userId }: subredditDeleteRequest) => {
      setRemovingUserId(userId);
    },
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">{subreddit.name}</Button>
      </SheetTrigger>
      <SheetContent position="right" size="content">
        <SheetHeader>
          <SheetTitle>Edit Subreddit</SheetTitle>
          <SheetDescription>
            Make changes to your subreddit here. Click save when you&rsquo;re
            done.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-y-7">
          <div className="flex flex-col gap-y-5 py-4 items-end">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={subredditName}
                onChange={(e) => setSubredditName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <Button
              size="sm"
              className="w-full sm:w-1/2"
              onClick={() => changeName()}
              isLoading={nameLoading}
            >
              Change name
            </Button>
          </div>
          <div className="flex flex-col gap-y-5 py-4 items-end">
            <Label htmlFor="members" className="text-left">
              Members
            </Label>
            <div className="flex flex-col gap-y-2 w-full">
              {subreddit.subscribers.map((subscriber) => (
                <div
                  className={cn(
                    buttonVariants({ variant: "subtle" }),
                    "flex items-center justify-start gap-x-4 w-full active:scale-100"
                  )}
                  key={subscriber.user.id}
                >
                  <span className="text-sm text-zinc-800 w-1/2 truncate">
                    {subscriber.user.name}
                  </span>

                  <div className="flex justify-end w-1/2 gap-x-3 items-center">
                    {subscriber.user.id === user.id ? (
                      <>
                        <CustomToolTip trigger={Info} text="Subreddit Owner" />
                        <div className="sr-only">Subreddit Owner</div>
                      </>
                    ) : (
                      <>
                        {removeUserLoader &&
                        removingUserId === subscriber.user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                        ) : (
                          <CustomAlertDialog
                            onClick={() =>
                              removeUser({
                                userId: subscriber.user.id,
                                subredditId: subscriber.subredditId,
                              })
                            }
                            descriptipn="This action cannot be undone. You are about to remove a user from this subreddit."
                          >
                            <Ban className="cursor-pointer h-4 w-4 text-zinc-400 hover:text-zinc-500 transition" />
                          </CustomAlertDialog>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter>
          {/* <SheetClose asChild>
            <Button type="submit">Done</Button>
          </SheetClose> */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SubredditSheet;
