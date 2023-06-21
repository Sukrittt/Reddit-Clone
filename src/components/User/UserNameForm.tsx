"use client";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { User } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/Card";
import { Label } from "@/ui/Label";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { toast } from "@/hooks/use-toast";
import { useAuthToast } from "@/hooks/useAuthToast";
import { UserNameType, UserNameValidator } from "@/lib/validators/username";

interface UserNameFormProps {
  user: Pick<User, "username" | "id">;
}

const UserNameForm: FC<UserNameFormProps> = ({ user }) => {
  const { loginToast } = useAuthToast();
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UserNameType>({
    resolver: zodResolver(UserNameValidator),
    defaultValues: {
      name: user?.username || "",
    },
  });

  const { mutate: updateUserName, isLoading } = useMutation({
    mutationFn: async ({ name }: UserNameType) => {
      const payload: UserNameType = { name };

      const { data } = await axios.patch("/api/settings/user", payload);
      return data as string;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const responseStatus = error.response?.status;

        if (responseStatus === 401) {
          return loginToast();
        } else if (responseStatus === 409) {
          return toast({
            title: "Username already taken.",
            description: "Please try another one.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "There was an error.",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        description: "Your username has been updated.",
      });
      router.refresh();
    },
  });

  return (
    <form onSubmit={handleSubmit((e) => updateUserName(e))}>
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>
            Please enter a display name you are comfortable with
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>
            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              className="w-full sm:w-[400px] pl-6"
              size={32}
              {...register("name")}
            />

            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" isLoading={isLoading}>
            Change name
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UserNameForm;
