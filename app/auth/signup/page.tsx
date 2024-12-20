//app/auth/signup/page.tsx
"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import SEO from "@/components/SEO";
import "react-toastify/dist/ReactToastify.css";
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function SignUp() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showFallbackLink, setShowFallbackLink] = useState(false);

  const handleSignUp = async (provider: string) => {
  setLoading(true);
  try {
    const response = await signIn(provider, { redirect: false });
    if (response?.error === "OAuthAccountNotLinked") {
      toast.error("Account not linked. Please use your original provider.");
    } else if (!response?.ok) {
      toast.error("Sign-in failed. Please try again.");
    } else {
      toast.success("Signed in successfully!");
      router.push("/dashboard");
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
    toast.error("Sign-in failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (session) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      const fallbackTimer = setTimeout(() => {
        setShowFallbackLink(true);
      }, 5000);
      return () => {
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
      };
    }
  }, [session, router]);

  return (
    <>
      <SEO
        title="Sign Up - InspireGem"
        description="Sign up for InspireGem using your Google or GitHub account to start creating AI-powered content."
      />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 py-6 px-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Sign Up</h1>
        <p className="text-base sm:text-lg mb-4">Sign up with your preferred method.</p>
        <div className="flex gap-4">
          <button
            onClick={() => handleSignUp("google")}
            className={`flex items-center bg-blue-500 text-white px-4 py-2 rounded ${loading ? "opacity-50" : "hover:bg-blue-600"}`}
            disabled={loading}
          >
            <FaGoogle className="mr-2" />
            {loading ? "Signing up..." : "Sign up with Google"}
          </button>
          <button
            onClick={() => handleSignUp("github")}
            className={`flex items-center bg-gray-800 text-white px-4 py-2 rounded ${loading ? "opacity-50" : "hover:bg-gray-900"}`}
            disabled={loading}
          >
            <FaGithub className="mr-2" />
            {loading ? "Signing up..." : "Sign up with GitHub"}
          </button>
        </div>
        {showFallbackLink && (
          <p className="mt-4 text-blue-500">
            Still don&apos;t get redirected to the dashboard?{" "}
            <a href="/dashboard" className="underline">
              Click here.
            </a>
          </p>
        )}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </div>
    </>
  );
}
