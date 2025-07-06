import { Button } from "@/components/ui/button";
import SignUpForm from "../../../components/signup-form";
import Link from "next/link";

export default function SignUp() {
  return (
    <div className="flex flex-col justify-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to EEG Prediction Dashboard
        </h1>
        <p className="text-gray-400">Create your account to get started</p>
      </div>

      <SignUpForm />

      <Link href="/auth/login" className="block w-full">
        <Button type="button" className="py-6 w-full">
          Already have an account? Login
        </Button>
      </Link>
    </div>
  );
}
