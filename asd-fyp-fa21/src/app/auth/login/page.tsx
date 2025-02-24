"use client";

import { Inter } from "next/font/google";

const inter = Inter();

export default function Login() {
  return (
    <>
      <h1 className={`mb-4 text-xl font-bold ${inter.className}`}>
        Welcom to EEG Prediction Dashboard
      </h1>
      <p>Login to EEG Prediction Dashboard</p>
    </>
  );
}
