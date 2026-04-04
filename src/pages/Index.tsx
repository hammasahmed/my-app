// export default Index;
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import Navbar from "../components/ui/navbar";
import HeroTexts from "../components/ui/hero-texts";
import { CircularTestimonials } from "../components/ui/circular-testimonials";
import monnimage from "../assets/moon.png";
import { AuroraBackground } from "../components/ui/aurora-background";
import { TracingBeam } from "../components/ui/tracing-beam";

const navLinks = ["Home", "Work", "Socials", "Contact"] as const;
type SectionId = (typeof navLinks)[number] extends infer T
  ? T extends string
    ? Lowercase<T>
    : never
  : never;

type PortfolioItem = {
  title: string;
  description: string;
  youtubeId: string;
  tag: string;
  publishedAt?: string;
};

const formSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type TestimonialItem = {
  _id: string;
  name: string;
  designation: string;
  quote: string;
  src: string;
};

const toAbsoluteUrl = (url: string) =>
  url && !/^https?:\/\//i.test(url) ? `https://${url}` : url;

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<PortfolioItem | null>(null);
  const [videosLoadState, setVideosLoadState] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [hiddenVideos, setHiddenVideos] = useState<Set<string>>(new Set());
  const [socialLinks, setSocialLinks] = useState({ instagram: "", facebook: "" });
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });
  // Placeholder for fetched data
  const datafetch = async () => {
    setVideosLoadState("loading");
    try {
      const res = await axios.get("http://localhost:4000/api/data");
      const mappedVideos: PortfolioItem[] = (res.data?.items ?? [])
        .map((item: any) => {
          const youtubeId =
            item?.snippet?.resourceId?.videoId ??
            item?.contentDetails?.videoId ??
            item?.id?.videoId ??
            (typeof item?.id === "string" ? item.id : undefined);

          if (!youtubeId) return null;

          return {
            title: item?.snippet?.title ?? "Untitled",
            description: item?.snippet?.description ?? "",
            youtubeId,
            tag: item?.snippet?.channelTitle ?? "Video",
            publishedAt: item?.snippet?.publishedAt,
          };
        })
        .filter((video): video is PortfolioItem => Boolean(video))
        .sort((a, b) => {
          if (!a.publishedAt && !b.publishedAt) return 0;
          if (!a.publishedAt) return 1;
          if (!b.publishedAt) return -1;
          return (
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
          );
        });

      setPortfolioItems(mappedVideos);
      setCurrentVideo(mappedVideos[0] ?? null);
      setVideosLoadState("ready");
    } catch (err) {
      console.error("Error fetching data:", err);
      setPortfolioItems([]);
      setCurrentVideo(null);
      setVideosLoadState("error");
    }
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Smooth scroll + active section highlight
  useEffect(() => {
    const sectionIds: SectionId[] = ["home", "work", "socials", "contact"];
    datafetch();
    axios.get("http://localhost:4000/api/testimonials").then(res => setTestimonials(res.data)).catch(() => {});
    axios.get("http://localhost:4000/api/hidden-videos").then(res => setHiddenVideos(new Set(res.data))).catch(() => {});
    axios.get("http://localhost:4000/api/social-links").then(res => setSocialLinks({ instagram: res.data.instagram ?? "", facebook: res.data.facebook ?? "" })).catch(() => {});
    // Update portfolio items with fetched data
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollTop(scrollY > 300);

      let current: SectionId = "home";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const offsetTop = rect.top + window.scrollY;
        if (scrollY >= offsetTop - 200) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id: SectionId) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setSubmitStatus("idle");
      await axios.post("http://localhost:4000/api/contact", values);
      setSubmitStatus("success");
      form.reset();
    } catch {
      setSubmitStatus("error");
    }
  }

  return (
    <TracingBeam>
    <div className="w-full overflow-x-hidden relative">
      <div className="absolute z-10 bg-transparent w-[calc(31.25rem/2)] h-[calc(31.25rem/2)] lg:w-125 lg:h-125 top-0 right-0 pointer-events-none">
        <img
          src={monnimage}
          className="w-full h-full object-cover block"
          alt=""
        />
      </div>

      <div className="min-h-screen w-full scroll-smooth ">
        <Navbar />

        {/* Main Layout with side gutters */}
        <div className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:pt-0 flex flex-col items-center">
          <div className=" flex flex-col gap-24 md:gap-32 ">
            {/* Hero */}
            <AuroraBackground
              id="home"
              className="flex flex-col items-center gap-8 rounded-3xl"
              showRadialGradient={true}
            >
              <HeroTexts handleNavClick={handleNavClick} />
            </AuroraBackground>
            <div className="flex justify-center">
              <div className="w-[60vw]   border rounded-4xl border-border/60 bg-card/60 shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-2 w-2 rounded-full bg-rose-500" />
                    <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" />
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="truncate text-[11px] sm:text-xs">
                    {videosLoadState === "loading" && "Loading latest video…"}
                    {videosLoadState === "error" && "Could not load videos"}
                    {videosLoadState === "ready" &&
                      currentVideo &&
                      `${currentVideo.title} – Showreel preview`}
                    {videosLoadState === "ready" && !currentVideo && "No videos yet"}
                  </span>
                  <span className="shrink-0">
                    {currentVideo && (
                      <a
                        href={`https://www.youtube.com/watch?v=${currentVideo.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-sky-400/90 hover:text-sky-300"
                      >
                        Open on YouTube
                      </a>
                    )}
                  </span>
                </div>
                <div className="relative aspect-video">
                  {currentVideo ? (
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${currentVideo.youtubeId}?rel=0&modestbranding=1`}
                      title={currentVideo.title}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/30 text-xs text-muted-foreground">
                      {videosLoadState === "loading"
                        ? "Loading…"
                        : "No video to preview"}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                </div>
              </div>
            </div>

            {/* Video Portfolio */}
            <div className="flex justify-center">
              <section
                id="work"
                className="flex flex-col items-center gap-6 text-center w-[80vw]"
              >
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
                    Selected Work
                  </p>
                  <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                    Video portfolio
                  </h2>
                  <p className="max-w-xl text-sm text-muted-foreground">
                    A mix of client work and personal pieces, focused on pace,
                    rhythm, and strong visual storytelling.
                  </p>
                </div>

                <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {portfolioItems
                    .filter(
                      (item) => item.youtubeId !== currentVideo?.youtubeId && !hiddenVideos.has(item.youtubeId)
                    )
                    .slice(0, showAllVideos ? undefined : 9)
                    .map((item) => (
                    <a
                      key={item.youtubeId}
                      href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/70 text-left shadow-md shadow-black/40 transition-transform duration-150 hover:-translate-y-1 hover:border-sky-500/80 hover:shadow-xl hover:shadow-sky-500/30"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        {/* YouTube thumbnail image */}
                        <img
                          src={`https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
                          }}
                        />

                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 text-sky-400 shadow-lg shadow-black/60 transition group-hover:bg-background/95 group-hover:scale-110">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-5 w-5"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>

                        {/* Tag overlay at bottom */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-xs text-white/80">
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                            {item.tag}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-1 px-4 py-3">
                        <h3 className="text-sm font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground/90">
                          {item.description}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>

                {portfolioItems.filter(item => item.youtubeId !== currentVideo?.youtubeId && !hiddenVideos.has(item.youtubeId)).length > 9 && (
                  <button
                    onClick={() => setShowAllVideos(prev => !prev)}
                    className="mt-2 rounded-full border border-border/70 px-6 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-sky-400 hover:text-sky-300"
                  >
                    {showAllVideos ? "Show less" : "Show more"}
                  </button>
                )}
              </section>
            </div>
            {/* Social Feeds */}
            <style>{`
              @keyframes spin-border { to { --magic-angle: 360deg; } }
              @property --magic-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
              .magic-border-ig { --magic-angle: 0deg; }
              .magic-border-ig:hover { animation: spin-border 3s linear infinite; }
              .magic-border-ig::before {
                content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 2px;
                background: conic-gradient(from var(--magic-angle), #f472b6, #fb923c, #facc15, #f472b6);
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor; mask-composite: exclude;
                opacity: 0; transition: opacity 0.3s; pointer-events: none;
              }
              .magic-border-ig:hover::before { opacity: 1; }
              .magic-border-fb { --magic-angle: 0deg; }
              .magic-border-fb:hover { animation: spin-border 3s linear infinite; }
              .magic-border-fb::before {
                content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 2px;
                background: conic-gradient(from var(--magic-angle), #38bdf8, #818cf8, #6366f1, #38bdf8);
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor; mask-composite: exclude;
                opacity: 0; transition: opacity 0.3s; pointer-events: none;
              }
              .magic-border-fb:hover::before { opacity: 1; }
            `}</style>
            <section id="socials" className="flex flex-col items-center gap-16 px-4 sm:px-8">
              {/* Instagram */}
              <div className="magic-border-ig relative w-full max-w-4xl space-y-4 rounded-3xl border border-border/80 bg-card/70 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.55)] transition-shadow duration-300 hover:shadow-pink-500/20">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-400">
                      Instagram
                    </p>
                    <h3 className="text-2xl font-bold text-foreground">
                      @studio.handle
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Daily cuts, breakdowns, and behind-the-scenes clips.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="rounded-full bg-background/80 px-3 py-1">
                      24k followers
                    </div>
                    <a
                      href={socialLinks.instagram ? toAbsoluteUrl(socialLinks.instagram) : undefined}
                      target={socialLinks.instagram ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      onClick={!socialLinks.instagram ? (e) => e.preventDefault() : undefined}
                      className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-md"
                      style={{
                        backgroundColor: "#ec4899",
                        boxShadow: "0 4px 14px rgba(236,72,153,0.4)",
                        transition: "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
                        opacity: socialLinks.instagram ? 1 : 0.5,
                        cursor: socialLinks.instagram ? "pointer" : "not-allowed",
                      }}
                      onMouseEnter={e => { if (!socialLinks.instagram) return; const el = e.currentTarget; el.style.backgroundColor = "#db2777"; el.style.transform = "scale(1.07)"; el.style.boxShadow = "0 6px 20px rgba(236,72,153,0.65)"; }}
                      onMouseLeave={e => { const el = e.currentTarget; el.style.backgroundColor = "#ec4899"; el.style.transform = "scale(1)"; el.style.boxShadow = "0 4px 14px rgba(236,72,153,0.4)"; }}
                    >
                      View profile
                    </a>
                  </div>
                </div>

              </div>

              {/* Facebook */}
              <div className="magic-border-fb relative w-full max-w-4xl space-y-4 rounded-3xl border border-border/80 bg-card/70 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.55)] transition-shadow duration-300 hover:shadow-sky-500/20">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
                      Facebook
                    </p>
                    <h3 className="text-2xl font-bold text-foreground">
                      Studio page
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Longer edits, client reels, and campaign launches.
                    </p>
                  </div>
                  <a
                    href={socialLinks.facebook ? toAbsoluteUrl(socialLinks.facebook) : undefined}
                    target={socialLinks.facebook ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    onClick={!socialLinks.facebook ? (e) => e.preventDefault() : undefined}
                    className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-md"
                    style={{
                      backgroundColor: "#0ea5e9",
                      boxShadow: "0 4px 14px rgba(14,165,233,0.4)",
                      transition: "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
                      opacity: socialLinks.facebook ? 1 : 0.5,
                      cursor: socialLinks.facebook ? "pointer" : "not-allowed",
                    }}
                    onMouseEnter={e => { if (!socialLinks.facebook) return; const el = e.currentTarget; el.style.backgroundColor = "#0284c7"; el.style.transform = "scale(1.07)"; el.style.boxShadow = "0 6px 20px rgba(14,165,233,0.65)"; }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.backgroundColor = "#0ea5e9"; el.style.transform = "scale(1)"; el.style.boxShadow = "0 4px 14px rgba(14,165,233,0.4)"; }}
                  >
                    View feed
                  </a>
                </div>

              </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="flex flex-col items-center gap-6 text-center px-4 sm:px-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
                  Kind Words
                </p>
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                  What clients say
                </h2>
              </div>
              {testimonials.length === 0 ? (
                <p className="text-sm text-muted-foreground">No testimonials yet.</p>
              ) : (
              <CircularTestimonials
                testimonials={testimonials}
                autoplay={true}
                colors={{
                  name: "var(--foreground)",
                  designation: "var(--muted-foreground)",
                  testimony: "var(--muted-foreground)",
                  arrowBackground: "#141414",
                  arrowForeground: "#f1f1f7",
                  arrowHoverBackground: "#00A6FB",
                }}
                fontSizes={{ name: "24px", designation: "14px", quote: "16px" }}
              />
              )}
            </section>

            {/* Contact */}
            <section
              id="contact"
              className="flex flex-col items-center gap-6 text-center px-4 sm:px-8"
            >
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                  Let&apos;s work together
                </p>
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                  Tell me about your project
                </h2>
                <p className="max-w-xl text-sm text-muted-foreground">
                  Send a quick brief and I&apos;ll respond with ideas, rough
                  timelines, and budget ranges.
                </p>
              </div>

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full max-w-2xl space-y-6 rounded-3xl border border-border/80 bg-card/80 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.65)]"
                style={{
                  boxShadow: "0 0 0 1px hsl(210 10% 23% / 0.5)",
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 text-left">
                    <label
                      htmlFor="name"
                      className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      autoComplete="name"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none  transition-shadow focus-visible:ring-2 focus-visible:ring-sky-500 "
                      {...form.register("name")}
                    />
                    {form.formState.errors.name?.message && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 text-left">
                    <label
                      htmlFor="email"
                      className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email?.message && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label
                    htmlFor="message"
                    className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Project details
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="What are you planning? Timeline, goals, platforms…"
                    className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 placeholder:text-muted-foreground"
                    {...form.register("message")}
                  />
                  {form.formState.errors.message?.message && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/40 transition-transform duration-150 hover:scale-[1.02] active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {form.formState.isSubmitting
                      ? "Sending..."
                      : "Send message"}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    I usually reply within{" "}
                    <span className="font-semibold text-foreground">
                      24 hours
                    </span>
                    .
                  </p>
                </div>

                {submitStatus === "success" && (
                  <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                    Thanks for reaching out – I&apos;ll get back to you soon.
                  </p>
                )}
                {submitStatus === "error" && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            </section>
          </div>
        </div>
        {/* Scroll to top button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-4 inline-flex h-10 w-10 z-[100] items-center justify-center rounded-full border border-border/70 bg-card/80 text-muted-foreground shadow-lg shadow-black/50 backdrop-blur-md transition-transform hover:-translate-y-1 hover:text-foreground"
          >
            ↑
          </button>
        )}
        {/* Footer */}
        <footer className="border-t border-border/60 bg-background/20 backdrop-blur-xl">
          <div className="mx-auto flex max-xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.25em] text-muted-foreground">
                <span className="inline-block h-5 w-5 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 shadow-md shadow-sky-500/40" />
                <span>STUDIO</span>
              </div>
              <p className="max-w-md text-xs text-muted-foreground">
                Crafting bold visuals, rhythmic edits, and cinematic experiences
                for brands and artists worldwide.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-xs text-muted-foreground md:items-end">
              <div className="flex gap-3">
                {(['work', 'socials', 'contact'] as const).map((id) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                    className={id === 'contact'
                      ? 'rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-md shadow-primary/40 hover:brightness-110'
                      : 'rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:border-sky-400 hover:text-sky-300'}
                  >
                    {id === 'work' ? 'Portfolio' : id.charAt(0).toUpperCase() + id.slice(1)}
                  </a>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground/80">
                © {new Date().getFullYear()} Studio. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </TracingBeam>
  );
};

export default Index;
