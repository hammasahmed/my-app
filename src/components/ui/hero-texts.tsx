import { motion, type Easing } from "framer-motion";
import { useState, useEffect } from "react";

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

type SectionId = "home" | "work" | "socials" | "contact";

interface HeroTextsProps {
  handleNavClick: (id: SectionId) => (e: React.MouseEvent) => void;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as Easing, delay },
});

const HeroTexts = ({ handleNavClick }: HeroTextsProps) => {
  const projectsCount = useCountUp(50);
  const clientsCount = useCountUp(20);
  return (
    <div className="hero-texts flex flex-col items-center gap-8 text-center z-20 w-[100vw] lg:pt-24 min-h-[80vh] lg:min-h-0 justify-center">
      {/* Enhanced badge */}
      <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 px-4 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Available for freelance projects
      </motion.div>

      {/* Enhanced heading section */}
      <motion.div {...fadeUp(0.15)} className="space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-6xl">
          <span className="bg-gradient-to-r from-[#05855e] via-[#715caa] to-[#ffa448] dark:from-[#fcd34d] dark:via-[#fb923c] dark:to-[#f472b6] bg-clip-text text-transparent">
            Cinematic visuals
          </span>
          <span className="block mt-2 bg-gradient-to-r from-[#204552] via-[#52437B] to-[#A67C52] dark:from-[#7dd3fc] dark:via-[#a78bfa] dark:to-[#818cf8] bg-clip-text text-transparent">
            for bold brands.
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl leading-relaxed">
          I craft showreels, commercials, and social-first edits that
          <span className="text-foreground font-medium"> feel fast, polished, and unforgettable.</span>
        </p>
      </motion.div>

      {/* Stats/Trust indicators - New addition */}
      <motion.div {...fadeUp(0.3)} className="flex items-center justify-center gap-8 pt-4">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">{projectsCount}+</div>
          <div className="text-xs text-muted-foreground">Projects Completed</div>
        </div>
        <div className="h-8 w-px bg-border"></div>
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">{clientsCount}+</div>
          <div className="text-xs text-muted-foreground">Happy Clients</div>
        </div>
        <div className="h-8 w-px bg-border"></div>
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">3x</div>
          <div className="text-xs text-muted-foreground">Award Winner</div>
        </div>
      </motion.div>

      {/* Buttons - untouched as requested */}
      <motion.div {...fadeUp(0.45)} className="flex flex-wrap justify-center gap-3 my-14">
        <button
          onClick={handleNavClick("work")}
          className="relative px-6 py-2 border border-foreground text-foreground overflow-hidden group"
        >
          <span className="absolute inset-0 bg-foreground transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 group-hover:text-background transition-colors duration-300">
            View portfolio
          </span>
        </button>

        <button
          onClick={handleNavClick("contact")}
          className="relative px-6 py-2 border border-foreground text-foreground overflow-hidden group"
        >
          <span className="absolute inset-0 bg-foreground transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 group-hover:text-background transition-colors duration-300">
            Book a project call
          </span>
        </button>
      </motion.div>

      {/* Golden geometric — bottom-left */}
      <svg
        className="absolute bottom-0 left-0 z-10 w-72 h-72 opacity-60 pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,200 Q100,100 200,0" stroke="#C9A84C" strokeWidth="0.5" />
        <path d="M0,160 Q80,80 160,0" stroke="#C9A84C" strokeWidth="0.5" />
        <path d="M0,120 Q60,60 120,0" stroke="#C9A84C" strokeWidth="0.5" />
        <path d="M0,80 Q40,40 80,0" stroke="#C9A84C" strokeWidth="0.5" />
        <polyline points="0,50 0,0 50,0" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="28,155 42,141 56,155 42,169" stroke="#C9A84C" strokeWidth="0.8" fill="none" />
        <line x1="20" y1="185" x2="36" y2="185" stroke="#C9A84C" strokeWidth="0.6" />
        <line x1="28" y1="177" x2="28" y2="193" stroke="#C9A84C" strokeWidth="0.6" />
        <circle cx="10" cy="100" r="1" fill="#C9A84C" />
        <circle cx="10" cy="115" r="0.8" fill="#C9A84C" />
        <circle cx="10" cy="128" r="0.6" fill="#C9A84C" />
      </svg>

      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl"></div>
      </div>
    </div>
  );
};

export default HeroTexts;