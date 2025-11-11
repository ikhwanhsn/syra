"use client";

import { Button } from "@/components/ui/button";

const TestPage = () => {
  const tryATXP = async () => {
    const res = await fetch(`/api/atxp/x`);
    const data = await res.json();
    console.log("data", data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1>Test</h1>
      <Button variant="default" onClick={tryATXP}>
        Try ATXPs
      </Button>
    </div>
  );
};

export default TestPage;
