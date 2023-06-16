import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/ui/Button";
import SignIn from "@/components/SignIn";

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
          Home
        </Link>

        <SignIn />
      </div>
    </div>
  );
};

export default page;
