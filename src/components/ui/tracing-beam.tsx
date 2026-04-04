"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useTransform,
  useScroll,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";

export const TracingBeam = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const update = () => {
      if (contentRef.current) setSvgHeight(contentRef.current.offsetHeight);
      setViewportHeight(window.innerHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const svgDisplayHeight = viewportHeight - 80;

  const y1 = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, svgDisplayHeight]),
    { stiffness: 500, damping: 90 }
  );
  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [150, svgDisplayHeight + 150]),
    { stiffness: 500, damping: 90 }
  );

  return (
    <motion.div
      ref={ref}
      className={cn("relative mx-auto h-full w-full", className)}
    >
      <div className="fixed top-20 left-4 md:left-8 z-50">
        <svg
          viewBox={`0 0 20 ${svgDisplayHeight}`}
          width="20"
          height={svgDisplayHeight}
          className="ml-4 block"
          aria-hidden="true"
        >
          <motion.path
            d={`M 1 0 V ${svgDisplayHeight}`}
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0.16"
          />
          <motion.path
            d={`M 1 0 V ${svgDisplayHeight}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1.25"
            className="motion-reduce:hidden"
          />
          <defs>
            <motion.linearGradient
              id="gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1} // set y1 for gradient
              y2={y2} // set y2 for gradient
            >
              <stop stopColor="#18CCFC" stopOpacity="0"></stop>
              <stop stopColor="#18CCFC"></stop>
              <stop offset="0.325" stopColor="#6344F5"></stop>
              <stop offset="1" stopColor="#AE48FF" stopOpacity="0"></stop>
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
};
