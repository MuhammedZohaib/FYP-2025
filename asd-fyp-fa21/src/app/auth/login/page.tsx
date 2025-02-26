import Divider from "@/components/ui/divider";
import LoginForm from "./LoginForm";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";

export default function Login() {
  return (
    <>
      <div className="mb-3">
        <h1 className="mb-3 text-xl font-bold">
          Welcom to EEG Prediction Dashboard
        </h1>
        <p>Login to EEG Prediction Dashboard</p>
      </div>
      <div className="flex relative mb-3">
        <Button className="w-full mt-3 bg-[#D9D9D9] text-black hover:color-white hover:bg-[#D9D9D9]/90">
          <FaGoogle />
          Google
        </Button>
      </div>
      <Divider />
      <LoginForm />
    </>
  );
}
