'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { stiffness: 400, damping: 30, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const trailX = useSpring(mouseX, { stiffness: 120, damping: 25 });
  const trailY = useSpring(mouseY, { stiffness: 120, damping: 25 });

  useEffect(() => {
    // Only enable on pointer devices (desktops)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsDesktop(mediaQuery.matches);

    if (!mediaQuery.matches) return;

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('textarea');
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    document.documentElement.classList.add('hide-cursor');

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.documentElement.classList.remove('hide-cursor');
    };
  }, [mouseX, mouseY]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Trail (slow follower) */}
      <motion.div
        ref={cursorRef}
        className="pointer-events-none fixed z-[9998] rounded-full mix-blend-difference"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovering ? 44 : 28,
          height: isHovering ? 44 : 28,
          backgroundColor: isHovering ? '#00FF88' : '#1F4D3A',
          opacity: 0.25,
          transition: 'width 0.2s, height 0.2s, background-color 0.2s',
        }}
      />

      {/* Main cursor dot */}
      <motion.div
        className="pointer-events-none fixed z-[9999] rounded-full mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovering ? 8 : 6,
          height: isHovering ? 8 : 6,
          backgroundColor: isHovering ? '#00FF88' : '#2D7A5C',
          transition: 'width 0.15s, height 0.15s, background-color 0.15s',
        }}
      />
    </>
  );
}
