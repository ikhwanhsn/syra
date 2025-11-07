"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Profile from "@/components/profile/Profile";
import TanstackQueryProvider from "@/components/TanstackQueryProvider";

const ProfilePage = () => {
  return (
    <TanstackQueryProvider>
      <div className="min-h-screen">
        <Navbar />
        <div className="h-20"></div>
        <Profile />
        <Footer />
      </div>
    </TanstackQueryProvider>
  );
};

export default ProfilePage;
