import LoginForm from "../../../components/login-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Login() {
  return (
    <div className="flex flex-col justify-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to EEG Prediction Dashboard
        </h1>
        <p className="text-gray-400">Login to access your dashboard</p>
      </div>

      <LoginForm />

      <Link href="/auth/signup" className="block w-full">
        <Button type="button" className="py-6 w-full">
          Create an Account
        </Button>
      </Link>
    </div>
  );
}
