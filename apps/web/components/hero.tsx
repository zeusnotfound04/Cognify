"use client";

import Link from "next/link";
import { ParticleBackground } from "./ParticleBackground";
import { Pill } from "./pill";
import { Button } from "./ui/button";
import { useState } from "react";

export function Hero() {
  const [hovering, setHovering] = useState(false);
  return (
    <div className="flex flex-col h-svh justify-between relative">
      <ParticleBackground hovering={hovering} />

      <div className="pb-16 mt-auto text-center relative z-10">
        <Pill className="mb-6">AI-POWERED MEMORY</Pill>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading font-bold">
          Connect your <br />
          <i className="font-light bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">memories</i>
        </h1>
        <p className="font-mono text-sm sm:text-base text-foreground/60 text-balance mt-8 max-w-[440px] mx-auto">
          Visualize and explore your knowledge through intelligent memory networks
        </p>

        <Link className="contents max-sm:hidden" href="/login">
          <Button
            className="mt-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            Get Started
          </Button>
        </Link>
        <Link className="contents sm:hidden" href="/login">
          <Button
            size="sm"
            className="mt-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}
