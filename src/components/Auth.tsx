"use client";
import Link from "next/link";
import { Icons } from "./Icons";
import { useRouter } from "next/navigation";

import UserAuthForm from "@/components/UserAuthForm";

interface AuthProps {
  isModal?: boolean;
}

export const SignIn: React.FC<AuthProps> = ({ isModal = false }) => {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-6 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight">Welcome Back</h1>
        <p className="text-sm max-w-xs mx-auto">
          By continuing, you are setting up a Breadit account and agree to our
          User Agreement and Privacy Policy.
        </p>

        {/* sign in form */}
        <UserAuthForm />

        <p className="px-8 text-center text-sm text-zinc-700">
          New to Breadit?{" "}
          <Link
            href="/sign-up"
            className="hover:text-zinc-800 text-sm underline underline-offset-4"
            onClick={async (e) => {
              e.preventDefault();
              // router.replace("/sign-up");
              if (isModal) {
                router.replace("/sign-up");
              } else {
                router.push("/sign-up");
              }
            }}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export const SignUp: React.FC<AuthProps> = ({ isModal = false }) => {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-6 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight">Sign Up</h1>
        <p className="text-sm max-w-xs mx-auto">
          By continuing, you are setting up a Breadit account and agree to our
          User Agreement and Privacy Policy.
        </p>

        {/* sign in form */}
        <UserAuthForm />

        <p className="px-8 text-center text-sm text-zinc-700">
          Already a Bread eater?{" "}
          <Link
            href="/sign-in"
            className="hover:text-zinc-800 text-sm underline underline-offset-4"
            onClick={async (e) => {
              e.preventDefault();
              // router.replace("/sign-in");
              if (isModal) {
                router.replace("/sign-in");
              } else {
                router.push("/sign-in");
              }
            }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
