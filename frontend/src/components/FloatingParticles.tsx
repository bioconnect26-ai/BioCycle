import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatingParticlesProps {
  count?: number;
  children?: ReactNode;
}

const FloatingParticles = ({ count = 20 }: FloatingParticlesProps) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 4,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.id % 2 === 0
              ? "hsl(var(--emerald) / 0.4)"
              : "hsl(var(--cyan) / 0.3)",
          }}
          animate={{
            y: [0, -30, 15, 0],
            x: [0, 10, -10, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
