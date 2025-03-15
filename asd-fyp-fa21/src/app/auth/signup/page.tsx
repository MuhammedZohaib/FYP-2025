import { Button } from "@/components/ui/button";
import SignUpForm from "../../../components/signup-form";
import { FaGoogle } from "react-icons/fa";
import Divider from "@/components/ui/divider";
import Link from "next/link";

export default function SignUp() {
  return (
    <>
      <div className="mb-3">
        <h1 className="mb-3 text-xl font-bold">
          Welcom to EEG Prediction Dashboard
        </h1>
        <p>Signup to EEG Prediction Dashboard</p>
      </div>
      <div className="flex relative mb-3">
        <Button className="w-full mt-3 bg-[#D9D9D9] text-black hover:color-white hover:bg-[#D9D9D9]/90">
          <FaGoogle />
          Google
        </Button>
      </div>
      <Divider />
      <SignUpForm />
      <Link href="login" className="block w-full py-4">
        <Button type="button" className="py-6 w-full">
          Login to Dashboard
        </Button>
      </Link>
    </>
  );
}
