"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

import { Button } from "@/ui/Button";
import { useAuthToast } from "@/hooks/useAuthToast";
import { toast } from "@/hooks/use-toast";

const UserDeletion = () => {
  const router = useRouter();
  const { loginToast } = useAuthToast();

  const { mutate: deleteUser, isLoading } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete("/api/settings/user");
      return data;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const responseStatus = error.response?.status;

        if (responseStatus === 401) {
          return loginToast();
        }

        return toast({
          title: "Something went wrong.",
          description: "Your account was not deleted. Please try again.",
          variant: "destructive",
        });
      }
    },
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  return (
    <div>
      <Button
        variant="destructive"
        isLoading={isLoading}
        onClick={() => deleteUser()}
        className="border text-red-500 border-red-500 hover:text-white"
      >
        {isLoading ? "Deleting your account" : "Delete your account"}
      </Button>
    </div>
  );
};

export default UserDeletion;
