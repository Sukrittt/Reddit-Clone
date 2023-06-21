import { FC, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/AlertDialog";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";

interface AlertDeleteUserDialogProps {
  children: React.ReactNode;
  username: string | null;
  onClick: () => void;
}

export const AlertDeleteUserDialog: FC<AlertDeleteUserDialogProps> = ({
  children,
  username,
  onClick,
}) => {
  const [confirmationPage, setConfirmationPage] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  const handleOnClick = () => {
    onClick();
    reset();
  };

  const reset = () => {
    setConfirmationPage(false);
    setInput("");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {!confirmationPage && (
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          )}
          <AlertDialogDescription>
            {!confirmationPage ? (
              "This action cannot be undone. This will permanently delete your account and remove your data from our servers."
            ) : (
              <>
                To confirm type this{" "}
                <span className="font-semibold">&quot;u/{username}&quot;</span>{" "}
                in the box below.
              </>
            )}
          </AlertDialogDescription>
          {confirmationPage && (
            <Input value={input} onChange={(e) => setInput(e.target.value)} />
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={reset}>Cancel</AlertDialogCancel>
          {confirmationPage ? (
            <AlertDialogAction
              onClick={handleOnClick}
              disabled={input !== `u/${username}`}
            >
              Yes, delete
            </AlertDialogAction>
          ) : (
            <Button onClick={() => setConfirmationPage(true)}>Continue</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
