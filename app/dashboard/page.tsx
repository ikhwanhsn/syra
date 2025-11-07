"use client";

import CardStatistic from "@/components/dashboard/CardStatistic";
import SignalExplorer from "@/components/dashboard/SignalExplorer";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import TanstackQueryProvider from "@/components/TanstackQueryProvider";

const DashboardPage = () => {
  return (
    <TanstackQueryProvider>
      <div className="min-h-screen">
        <Navbar />
        <div className="h-20"></div>
        <CardStatistic />
        <SignalExplorer />
        <Footer />
      </div>
    </TanstackQueryProvider>
  );
};

export default DashboardPage;
