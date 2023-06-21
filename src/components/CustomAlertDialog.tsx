import { FC } from "react";

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

interface CustomAlertDialogProps {
  children: React.ReactNode;
  descriptipn: string;
  onClick: () => void;
}

const CustomAlertDialog: FC<CustomAlertDialogProps> = ({
  children,
  descriptipn,
  onClick,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button>{children}</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{descriptipn}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClick}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlertDialog;
