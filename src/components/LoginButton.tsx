"use client";
import { SignInButton } from "@clerk/nextjs";
import { LogIn } from "lucide-react";

export default function LoginButton() {
  return (
    <SignInButton mode="modal">
      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold shadow-lg">
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </button>
    </SignInButton>
  );
}
