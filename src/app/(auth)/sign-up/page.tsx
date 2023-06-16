import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { SignUp } from "@/components/Auth";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/ui/Button";

const page = () => {
  return (
    <div className="absolute inset-0">
      <div className="h-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-20">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "link" }),
            "self-start -mt-20"
          )}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Home
        </Link>

        <SignUp />
      </div>
    </div>
  );
};

export default page;
