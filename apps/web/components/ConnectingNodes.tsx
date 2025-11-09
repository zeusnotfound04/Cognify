'use client';

import { useCallback, useMemo } from "react";
import Particles from "@tsparticles/react";
import { loadBasic } from "@tsparticles/basic";
import { loadExternalConnectInteraction } from "@tsparticles/interaction-external-connect";
import { loadCircleShape } from "@tsparticles/shape-circle";
import { loadColorUpdater } from "@tsparticles/updater-color";
import { loadOpacityUpdater } from "@tsparticles/updater-opacity";
import { loadOutModesUpdater } from "@tsparticles/updater-out-modes";
import { loadSizeUpdater } from "@tsparticles/updater-size";
import type { Engine, Container } from "@tsparticles/engine";

interface ConnectingNodesProps {
  id: string;
  className?: string;
  memoryNodes?: Array<{
    id: string;
    x: number;
    y: number;
    type: 'conversation' | 'document' | 'integration' | 'note';
    connections: string[];
  }>;
}

export function ConnectingNodes({ id, className = "", memoryNodes = [] }: ConnectingNodesProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    // Load only the features you need
    await loadBasic(engine);
    await loadExternalConnectInteraction(engine);
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
        onClick: {
          enable: true,
          mode: "push",
        },
        onHover: {
          enable: true,
          mode: "connect",
        },
        resize: {
          enable: true,
        },
      },
      modes: {
        push: {
          quantity: 2,
        },
        connect: {
          distance: 200,
          links: {
            opacity: 0.8,
            color: "#8B5CF6",
          },
          radius: 150,
        },
      },
    },
    particles: {
      color: {
        value: ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B"],
      },
      links: {
        color: "#8B5CF6",
        distance: 120,
        enable: true,
        opacity: 0.4,
        width: 1.5,
        triangles: {
          enable: false,
        },
      },
      move: {
        direction: "none" as const,
        enable: true,
        outModes: {
          default: "bounce" as const,
        },
        random: true,
        speed: 1,
        straight: false,
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200,
        },
      },
      number: {
        density: {
          enable: true,
          width: 800,
          height: 600,
        },
        value: Math.max(15, memoryNodes.length * 2),
      },
      opacity: {
        value: 0.6,
        animation: {
          enable: true,
          speed: 1,
          minimumValue: 0.2,
          sync: false,
        },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 2, max: 6 },
        animation: {
          enable: true,
          speed: 2,
          minimumValue: 2,
          sync: false,
        },
      },
    },
    detectRetina: true,
    themes: [
      {
        name: "dark",
        default: {
          auto: true,
          mode: "dark" as const,
          value: true,
        },
        options: {
          particles: {
            color: {
              value: ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B"],
            },
            links: {
              color: "#8B5CF6",
              opacity: 0.5,
            },
          },
        },
      },
    ],
  }), [memoryNodes.length]);

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Particles
        id={id}
        particlesInit={particlesInit}
        options={options}
        className="w-full h-full"
      />
    </div>
  );
}