"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import HistorySignal from "@/components/signals/HistorySignal";
import SignalStatistic from "@/components/signals/SignalStatistic";
import TanstackQueryProvider from "@/components/TanstackQueryProvider";

const SignalsPage = () => {
  return (
    <TanstackQueryProvider>
      <div className="min-h-screen">
        <Navbar />
        <div className="h-20"></div>
        <SignalStatistic />
        <HistorySignal />
        <Footer />
      </div>
    </TanstackQueryProvider>
  );
};

export default SignalsPage;
