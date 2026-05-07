'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Dot: very snappy
  const dotX = useSpring(mouseX, { stiffness: 1000, damping: 40, mass: 0.1 });
  const dotY = useSpring(mouseY, { stiffness: 1000, damping: 40, mass: 0.1 });

  // Trail: slightly softer but still fast
  const trailX = useSpring(mouseX, { stiffness: 400, damping: 35, mass: 0.2 });
  const trailY = useSpring(mouseY, { stiffness: 400, damping: 35, mass: 0.2 });

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    setIsDesktop(mq.matches);
    if (!mq.matches) return;

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setIsHovering(
        !!(t.closest('a') || t.closest('button') || t.closest('[role="button"]') ||
           t.closest('input') || t.closest('textarea'))
      );
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    document.documentElement.classList.add('hide-cursor');

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      document.documentElement.classList.remove('hide-cursor');
    };
  }, [mouseX, mouseY]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Trail */}
      <motion.div
        className="pointer-events-none fixed z-[9998] rounded-full mix-blend-difference"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovering ? 40 : 24,
          height: isHovering ? 40 : 24,
          backgroundColor: isHovering ? '#00FF88' : '#1F4D3A',
          opacity: 0.3,
          transition: 'width 0.15s, height 0.15s, background-color 0.15s',
        }}
      />
      {/* Dot */}
      <motion.div
        className="pointer-events-none fixed z-[9999] rounded-full"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: 5,
          height: 5,
          backgroundColor: isHovering ? '#00FF88' : '#2D7A5C',
        }}
      />
    </>
  );
}
