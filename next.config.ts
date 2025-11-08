import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    TESTING_KEY: process.env.TESTING,
  },
};

export default nextConfig;
