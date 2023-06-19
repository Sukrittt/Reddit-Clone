import { Icons } from "@/components/Icons";
import UserAuthForm from "@/components/User/UserAuthForm";

export const SignIn = () => {
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
      </div>
    </div>
  );
};
