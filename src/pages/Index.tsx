// export default Index;
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import BASE_URL from "../lib/api";
import Navbar from "../components/ui/navbar";
// import HeroTexts from "../components/ui/hero-texts";
import { CircularTestimonials } from "../components/ui/circular-testimonials";
import monnimage from "../assets/moon.png";
// import { AuroraBackground } from "../components/ui/aurora-background";
import banner from "../assets/banner.jpeg";
import adImage from "../assets/ad.jpeg";

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

// const navLinks = ["Home", "Work", "Socials", "Contact"] as const;
// type SectionId = (typeof navLinks)[number] extends infer T
//   ? T extends string
//     ? Lowercase<T>
//     : never
//   : never;

const toAbsoluteUrl = (url: string) =>
  url && !/^https?:\/\//i.test(url) ? `https://${url}` : url;

const Index = () => {
  // const [_menuOpen, setMenuOpen] = useState(false);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<PortfolioItem | null>(null);
  const [, setVideosLoadState] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [hiddenVideos, setHiddenVideos] = useState<Set<string>>(new Set());
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
  });
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const bannerRef = useRef<HTMLDivElement>(null);
  const [navbarFixed, setNavbarFixed] = useState(false);

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
      const res = await axios.get(`${BASE_URL}/api/data`);
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
        .filter((video: PortfolioItem | null): video is PortfolioItem =>
          Boolean(video),
        )
        .sort((a: PortfolioItem, b: PortfolioItem) => {
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
  useEffect(() => {
    datafetch();
    axios
      .get(`${BASE_URL}/api/testimonials`)
      .then((res) => setTestimonials(res.data))
      .catch(() => {});
    axios
      .get(`${BASE_URL}/api/hidden-videos`)
      .then((res) => setHiddenVideos(new Set(res.data)))
      .catch(() => {});
    axios
      .get(`${BASE_URL}/api/social-links`)
      .then((res) =>
        setSocialLinks({
          instagram: res.data.instagram ?? "",
          facebook: res.data.facebook ?? "",
        }),
      )
      .catch(() => {});
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      const bannerHeight = bannerRef.current?.offsetHeight ?? 0;
      setNavbarFixed(window.scrollY > 0 && window.scrollY >= bannerHeight);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // const _handleNavClick = (id: SectionId) => (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   const el = document.getElementById(id);
  //   if (el) {
  //     el.scrollIntoView({ behavior: "smooth", block: "start" });
  //   }
  //   setMenuOpen(false);
  // };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setSubmitStatus("idle");
      await axios.post(`${BASE_URL}/api/contact`, values);
      setSubmitStatus("success");
      form.reset();
    } catch {
      setSubmitStatus("error");
    }
  }

  return (
    <>
      <div className="w-full overflow-x-hidden relative">
        <div className="absolute z-0 bg-transparent w-40 h-40 sm:w-64 sm:h-64 md:w-[calc(31.25rem/2)] md:h-[calc(31.25rem/2)] lg:w-125 lg:h-125 top-0 right-1/2 translate-x-1/2 sm:right-0 sm:translate-x-0 pointer-events-none opacity-90">
          <img
            src={monnimage}
            className="w-full h-full object-cover block blur-sm"
            alt=""
          />
        </div>

        <div className="min-h-screen w-full scroll-smooth ">
          <div ref={bannerRef} className="w-full overflow-hidden">
            <img
              src={banner}
              alt="Banner"
              className="h-auto w-full object-cover"
            />
          </div>

          {navbarFixed ? (
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 px-4">
              <Navbar />
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Navbar />
            </div>
          )}

          {/* Main Layout with side gutters */}
          <div className="w-full px-4 py-16 sm:px-6 lg:px-8 flex flex-row items-start gap-4">
            <div className="flex-1 flex flex-col items-center">
              <div className="flex flex-col gap-24 md:gap-6 w-full">
                {/* Hero — video player */}
                <div className="flex justify-center">
                  <div className="grid w-full max-w-7xl gap-6 lg:grid-cols-[10fr_2fr]">
                    {/* YouTube Video */}
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/70 shadow-[0_30px_120px_rgba(0,0,0,0.6)] sm:rounded-[3rem]">
                      <div className="relative aspect-[16/9] w-full">
                        {currentVideo ? (
                          <a
                            href={`https://www.youtube.com/watch?v=${currentVideo.youtubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-full w-full items-center justify-center bg-black"
                          >
                            <img
                              src={`https://img.youtube.com/vi/${currentVideo.youtubeId}/hqdefault.jpg`}
                              alt={currentVideo.title}
                              className="h-full w-full object-cover"
                            />

                            {/* Play Button */}
                            <div className="absolute inset-0 z-10 flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 68 48"
                                className="h-14 w-20 drop-shadow-xl"
                              >
                                <path
                                  d="M66.52 7.74a8 8 0 0 0-5.64-5.66C56.01 1 34 1 34 1s-22.01 0-26.88 1.08a8 8 0 0 0-5.64 5.66A83.5 83.5 0 0 0 0 24a83.5 83.5 0 0 0 1.48 16.26 8 8 0 0 0 5.64 5.66C11.99 47 34 47 34 47s22.01 0 26.88-1.08a8 8 0 0 0 5.64-5.66A83.5 83.5 0 0 0 68 24a83.5 83.5 0 0 0-1.48-16.26z"
                                  fill="#FF0000"
                                />
                                <path d="M45 24 27 14v20" fill="#fff" />
                              </svg>
                            </div>
                          </a>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted/30 text-xs text-muted-foreground">
                            No video
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ad Section */}
                    <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/70 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
                      <div className="relative h-full min-h-[220px] lg:min-h-full">
                        <img
                          src={adImage}
                          alt="Ad"
                          className="absolute inset-0 h-full w-full object-cover"
                        />

                        <div className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] text-white backdrop-blur">
                          Sponsored
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Portfolio */}
                <div className="flex justify-center w-full">
                  <section
                    id="work"
                    className="flex flex-col items-center gap-6 text-center w-full"
                  >
                    {/* <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
                        Selected Work
                      </p>
                      <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                        Video portfolio
                      </h2>
                      <p className="max-w-xl text-sm text-muted-foreground">
                        A mix of client work and personal pieces, focused on
                        pace, rhythm, and strong visual storytelling.
                      </p>
                    </div> */}

                    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                      {portfolioItems
                        .filter(
                          (item) =>
                            item.youtubeId !== currentVideo?.youtubeId &&
                            !hiddenVideos.has(item.youtubeId),
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
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 68 48"
                                  className="h-9 w-12"
                                >
                                  <path
                                    d="M66.52 7.74a8 8 0 0 0-5.64-5.66C56.01 1 34 1 34 1s-22.01 0-26.88 1.08a8 8 0 0 0-5.64 5.66A83.5 83.5 0 0 0 0 24a83.5 83.5 0 0 0 1.48 16.26 8 8 0 0 0 5.64 5.66C11.99 47 34 47 34 47s22.01 0 26.88-1.08a8 8 0 0 0 5.64-5.66A83.5 83.5 0 0 0 68 24a83.5 83.5 0 0 0-1.48-16.26z"
                                    fill="#FF0000"
                                  />
                                  <path d="M45 24 27 14v20" fill="#fff" />
                                </svg>
                              </div>

                              {/* Tag overlay at bottom */}
                              {/* <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-xs text-white/80">
                                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                                    {item.tag}
                                  </span>
                                </div> */}
                            </div>
                            {/* <div className="flex flex-1 flex-col gap-1 px-4 py-3">
                                <h3 className="text-sm font-semibold text-foreground">
                                  {item.title}
                                </h3>
                                <p className="text-xs text-muted-foreground/90">
                                  {item.description}
                                </p>
                              </div> */}
                          </a>
                        ))}
                    </div>

                    {portfolioItems.filter(
                      (item) =>
                        item.youtubeId !== currentVideo?.youtubeId &&
                        !hiddenVideos.has(item.youtubeId),
                    ).length > 9 && (
                      <button
                        onClick={() => setShowAllVideos((prev) => !prev)}
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
                <section
                  id="socials"
                  className="flex flex-col items-center gap-6 px-4 sm:px-8"
                >
                  <div className="space-y-2 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-400">
                      Socials
                    </p>
                    <h2 className="text-3xl font-bold text-foreground">
                      Find me online
                    </h2>
                  </div>
                  <div className="flex items-center gap-6">
                    {/* Instagram icon */}
                    <a
                      href={
                        socialLinks.instagram
                          ? toAbsoluteUrl(socialLinks.instagram)
                          : undefined
                      }
                      target={socialLinks.instagram ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      onClick={
                        !socialLinks.instagram
                          ? (e) => e.preventDefault()
                          : undefined
                      }
                      aria-label="Instagram"
                      className="magic-border-ig relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-card/70 shadow-md transition-transform duration-200 hover:scale-110 hover:shadow-pink-500/40"
                      style={{
                        opacity: socialLinks.instagram ? 1 : 0.4,
                        cursor: socialLinks.instagram
                          ? "pointer"
                          : "not-allowed",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-pink-400"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="20"
                          height="20"
                          rx="5"
                          ry="5"
                        />
                        <circle cx="12" cy="12" r="4" />
                        <circle
                          cx="17.5"
                          cy="6.5"
                          r="0.5"
                          fill="currentColor"
                          stroke="none"
                        />
                      </svg>
                    </a>
                    {/* Facebook icon */}
                    <a
                      href={
                        socialLinks.facebook
                          ? toAbsoluteUrl(socialLinks.facebook)
                          : undefined
                      }
                      target={socialLinks.facebook ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      onClick={
                        !socialLinks.facebook
                          ? (e) => e.preventDefault()
                          : undefined
                      }
                      aria-label="Facebook"
                      className="magic-border-fb relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-card/70 shadow-md transition-transform duration-200 hover:scale-110 hover:shadow-sky-500/40"
                      style={{
                        opacity: socialLinks.facebook ? 1 : 0.4,
                        cursor: socialLinks.facebook
                          ? "pointer"
                          : "not-allowed",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-6 w-6 text-sky-400"
                      >
                        <path
                          d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                </section>

                {/* Testimonials */}
                <section
                  id="testimonials"
                  className="flex flex-col items-center gap-6 text-center px-4 sm:px-8"
                >
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
                      Kind Words
                    </p>
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                      What clients say
                    </h2>
                  </div>
                  {testimonials.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No testimonials yet.
                    </p>
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
                      fontSizes={{
                        name: "24px",
                        designation: "14px",
                        quote: "16px",
                      }}
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
                        Thanks for reaching out – I&apos;ll get back to you
                        soon.
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

            {/* Ad Sidebar Right - visible only on large screens, sits beside the full page content */}
            {/* <div className="hidden lg:flex flex-col items-center sticky top-20 w-52 shrink-0 pr-4">
                <img
                  src={adImage}
                  alt="Advertisement"
                  className="w-full rounded-xl object-cover"
                />
              </div> */}
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
                  Crafting bold visuals, rhythmic edits, and cinematic
                  experiences for brands and artists worldwide.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 text-xs text-muted-foreground md:items-end">
                <div className="flex gap-3">
                  {(["work", "socials", "contact"] as const).map((id) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(id)?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className={
                        id === "contact"
                          ? "rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-md shadow-primary/40 hover:brightness-110"
                          : "rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:border-sky-400 hover:text-sky-300"
                      }
                    >
                      {id === "work"
                        ? "Portfolio"
                        : id.charAt(0).toUpperCase() + id.slice(1)}
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
    </>
  );
};

export default Index;
