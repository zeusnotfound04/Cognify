'use client';

import { useCallback, useMemo } from "react";
import Particles from "@tsparticles/react";
import { loadBasic } from "@tsparticles/basic";
import { loadCircleShape } from "@tsparticles/shape-circle";
import { loadColorUpdater } from "@tsparticles/updater-color";
import { loadOpacityUpdater } from "@tsparticles/updater-opacity";
import { loadOutModesUpdater } from "@tsparticles/updater-out-modes";
import { loadSizeUpdater } from "@tsparticles/updater-size";
import type { Engine, Container } from "@tsparticles/engine";

interface ParticleBackgroundProps {
  hovering?: boolean;
}

export function ParticleBackground({ hovering = false }: ParticleBackgroundProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadBasic(engine);
    await loadCircleShape(engine);
    await loadColorUpdater(engine);
    await loadOpacityUpdater(engine);
    await loadOutModesUpdater(engine);
    await loadSizeUpdater(engine);
  }, []);

  const options = useMemo(() => ({
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: {
          enable: true,
        },
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: hovering ? "#8B5CF6" : "#6B7280",
      },
      links: {
        color: hovering ? "#8B5CF6" : "#374151",
        distance: 150,
        enable: true,
        opacity: hovering ? 0.6 : 0.3,
        width: 1,
      },
      move: {
        direction: "none" as const,
        enable: true,
        outModes: {
          default: "bounce" as const,
        },
        random: false,
        speed: hovering ? 2 : 0.5,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          width: 800,
          height: 600,
        },
        value: 80,
      },
      opacity: {
        value: hovering ? 0.8 : 0.5,
        animation: {
          enable: true,
          speed: 1,
          minimumValue: 0.1,
          sync: false,
        },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
        animation: {
          enable: hovering,
          speed: 3,
          minimumValue: 1,
          sync: false,
        },
      },
    },
    detectRetina: true,
  }), [hovering]);

  return (
    <div className="absolute inset-0 z-0">
      <Particles
        id="hero-particles"
        particlesInit={particlesInit}
        options={options}
        className="w-full h-full"
      />
    </div>
  );
}