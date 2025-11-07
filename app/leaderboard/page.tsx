"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const LeaderboardPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <Navbar />
        <div className="h-20"></div>
        <Leaderboard />
        <Footer />
      </div>
    </QueryClientProvider>
  );
};

export default LeaderboardPage;
