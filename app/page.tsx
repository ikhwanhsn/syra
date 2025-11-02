"use client";

import Image from "next/image";
import Link from "next/link";
import UnicornScene from "unicornstudio-react/next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { TextLoop } from "@/components/motion-primitives/text-loop";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { Bot } from "@/components/animate-ui/icons/bot";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Blocks } from "@/components/animate-ui/icons/blocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const links = [
  // { href: "/github", label: "GitHub" },
  { href: "https://syra.gitbook.io/syra-docs", label: "Documentation" },
  { href: "https://x.com/syra_agent", label: "X" },
  { href: "/feedback", label: "Feedback" },
];

export default function Home() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
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
        <Image
          src="/images/logo-transparent.png"
          alt="Syra Logo"
          width={128}
          height={128}
          className="rounded-full absolute top-0 left-0 z-20"
        />
        <div className="absolute top-15 right-15 flex gap-5 z-20">
          {links.map((link) => {
            if (link.href === "/feedback") {
              return null;
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
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
        <div className="z-10 flex flex-col items-center justify-center text-center">
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
        </div>
        <footer className="absolute bottom-5 text-gray-500 text-sm z-20">
          &copy; 2025 Syra. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
