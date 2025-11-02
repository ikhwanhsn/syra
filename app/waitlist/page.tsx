"use client";

import Image from "next/image";
import Link from "next/link";
import UnicornScene from "unicornstudio-react/next";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

const links = [
  // { href: "/github", label: "GitHub" },
  { href: "https://syra.gitbook.io/syra-docs", label: "Documentation" },
  { href: "https://x.com/syra_agent", label: "X" },
  { href: "/waitlist", label: "Waitlist" },
  { href: "/feedback", label: "Feedback" },
];

export default function Home() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitWaitlist = async () => {
    const res = await fetch(`/api/waitlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username }),
    });
    const data = await res.json();
    if (data.error) {
      toast.error(data.error);
      return;
    }
    toast.success("Thanks for your waitlist!");
  };

  const handleSubmit = () => {
    if (!email || !username) return;

    setIsSubmitting(true);
    submitWaitlist().then(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail("");
      setUsername("");

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    });
  };
  const feedbackSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get("username") as string;
    const feedback = formData.get("feedback") as string;
    toast.promise<{ name: string }>(
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            resolve({ name: "Feedback" });
            setFeedbackOpen(false);
            setIsSubmittingFeedback(false);
          }, 2000)
        ),
      {
        loading: "Submitting feedback...",
        success: (data) => `Thanks for your feedback, it's matter to us!`,
        error: "Error",
      }
    );
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Dark Dot Matrix */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: "#0a0a0a",
          backgroundImage: `
       radial-gradient(circle at 25% 25%, #222222 0.5px, transparent 1px),
       radial-gradient(circle at 75% 75%, #111111 0.5px, transparent 1px)
     `,
          backgroundSize: "10px 10px",
          imageRendering: "pixelated",
        }}
      />
      {/* Your Content Here */}
      <div className="relative flex flex-col min-h-screen w-full items-center justify-center overflow-hidden">
        <div className="fixed inset-0 z-0 w-screen h-screen scale-150 opacity-20">
          <UnicornScene
            projectId="Fhi4t0mW37DNLD0b8SoL"
            width="100%"
            height="100%"
          />
        </div>
        {/* App Bar */}
        <Link href="/" className="absolute top-0 left-0 z-20 cursor-pointer">
          <Image
            src="/images/logo-transparent.png"
            alt="Syra Logo"
            width={128}
            height={128}
            className="rounded-full cursor-pointer"
          />
        </Link>
        <div className="absolute top-15 right-15 flex gap-5 z-20">
          {links.map((link) => {
            if (link.href === "/feedback") {
              return null;
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : "_self"}
                className="text-white hover:text-gray-300"
              >
                {link.label}
              </Link>
            );
          })}
          <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
            <DialogTrigger asChild>
              <p className="text-white hover:text-gray-300 cursor-pointer">
                Feedback
              </p>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={feedbackSubmit}>
                <DialogHeader>
                  <DialogTitle>Feedback</DialogTitle>
                  <DialogDescription>
                    We would love to hear from you! Please let us know how we
                    can improve.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 mt-3">
                  <div className="grid gap-3">
                    <Label htmlFor="username-1">Username Telegram</Label>
                    <Input
                      id="username-1"
                      name="username"
                      required
                      placeholder="@syra_agent"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="feedback-1">Feedback</Label>
                    <Input
                      id="feedback-1"
                      name="feedback"
                      defaultValue=""
                      required
                      placeholder="Your feedback..."
                    />
                  </div>
                </div>
                <DialogFooter className="mt-3">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmittingFeedback}>
                    {isSubmittingFeedback ? "Submitting..." : "Submit"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {/* Hero Content */}
        <div className="relative flex flex-col min-h-screen w-full items-center justify-center overflow-hidden px-4">
          {/* Main Content */}
          <div className="z-10 flex flex-col items-center justify-center text-center max-w-2xl w-full">
            <h1 className="text-6xl font-bold text-zinc-50 mb-4">
              Join the{" "}
              <span className="bg-linear-to-r from-zinc-50 to-zinc-600 bg-clip-text text-transparent">
                Waitlist
              </span>
            </h1>

            <p className="text-xl text-zinc-300 mb-8">
              Be among the first to experience the future of automated trading.
              Get early access to Syra Web App.
            </p>

            {/* Waitlist Form */}
            <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 shadow-2xl">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    You're on the list!
                  </h3>
                  <p className="text-zinc-400">
                    We'll notify you when we launch.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-zinc-300 text-left"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="telegram"
                      className="block text-sm font-medium text-zinc-300 text-left"
                    >
                      Telegram Username
                    </label>
                    <input
                      id="telegram"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="@syra_agent"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !email || !username}
                    className="w-full bg-black text-white px-6 py-3 rounded-lg text-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Joining...
                      </span>
                    ) : (
                      "Join Waitlist"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
              <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-white font-semibold mb-2">
                  Lightning Fast
                </h3>
                <p className="text-zinc-400 text-sm">
                  Execute trades in milliseconds
                </p>
              </div>
              <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🛡️</div>
                <h3 className="text-white font-semibold mb-2">Secure</h3>
                <p className="text-zinc-400 text-sm">Bank-level encryption</p>
              </div>
              <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
                <p className="text-zinc-400 text-sm">
                  Smart trading algorithms
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="absolute bottom-5 text-gray-500 text-sm z-20">
            &copy; 2025 Syra. All rights reserved.
          </footer>
        </div>
        {/* <div className="z-10 flex flex-col items-center justify-center text-center">
          <h1 className="text-6xl font-bold text-zinc-50">
            Trade smarter, faster,{" "}
            <TextLoop
              className="overflow-y-clip"
              transition={{
                type: "spring",
                stiffness: 900,
                damping: 80,
                mass: 10,
              }}
              variants={{
                initial: {
                  y: 20,
                  rotateX: 90,
                  opacity: 0,
                  filter: "blur(4px)",
                },
                animate: {
                  y: 0,
                  rotateX: 0,
                  opacity: 1,
                  filter: "blur(0px)",
                },
                exit: {
                  y: -20,
                  rotateX: -90,
                  opacity: 0,
                  filter: "blur(4px)",
                },
              }}
            >
              <span>stronger</span>
              <span>brighter</span>
              <span>steadier</span>
              <span>powerful</span>
              <span>decisive</span>
            </TextLoop>
          </h1>
          <TextEffect
            per="word"
            as="h3"
            preset="blur"
            className="mt-5 text-zinc-50"
          >
            Profit is just about getting it right. We do the hard work for you.
            Make money never been easier.
          </TextEffect>
          <div className="flex gap-4 mt-6">
            <Link href="https://t.me/syra_trading_bot" target="_blank">
              <button className="bg-transparent text-white px-6 py-3 rounded-full text-lg font-bold border-4 border-blue-500 hover:bg-blue-500 cursor-pointer w-60 transition-colors duration-300">
                <AnimateIcon
                  animateOnHover
                  className="flex items-center gap-1 justify-center"
                >
                  <Bot />
                  Try Telegram Bot
                </AnimateIcon>
              </button>
            </Link>
            <Tooltip>
              <TooltipTrigger>
                <button className="bg-white text-zinc-900 px-6 py-3 rounded-full text-lg font-bold w-60 transition-colors duration-300 hover:bg-gray-300">
                  <AnimateIcon
                    animateOnHover
                    animation="path-loop"
                    className="flex items-center gap-1.5 justify-center"
                  >
                    <Blocks size={24} />
                    Try Web App
                  </AnimateIcon>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>This feature is currently under development.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div> */}
        <footer className="absolute bottom-5 text-gray-500 text-sm z-20">
          &copy; 2025 Syra. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
