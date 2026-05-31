// export default Index;
import { useEffect, useRef, useState, type TouchEvent } from "react";
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
import adImage1 from "../assets/New1.jpeg";
import adImage2 from "../assets/New2.jpeg";
import adImage3 from "../assets/New3.jpeg";
import adImage4 from "../assets/New4.jpeg";

type PortfolioItem = {
  title: string;
  description: string;
  youtubeId: string;
  tag: string;
  publishedAt?: string;
};

const phoneRegex = /^(\+92|92|0)?3[0-9]{9}$/; // Pakistan WhatsApp number validation

const nameRegex = /^[A-Za-z\s]+$/;

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name is too short")
    .regex(nameRegex, "Name should contain only letters"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),

  whatsapp: z
    .string()
    .trim()
    .min(1, "WhatsApp number is required")
    .regex(phoneRegex, "Invalid WhatsApp number"),

  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .min(10, "Message must be at least 10 characters"),
});

type TestimonialItem = {
  _id: string;
  name: string;
  designation: string;
  quote: string;
  src: string;
};

const images = [adImage1, adImage2, adImage3, adImage4];
const galleryImages = [
  adImage1,
  adImage2,
  adImage3,
  adImage4,
  adImage1,
  adImage2,
  adImage3,
  adImage4,
];
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
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<PortfolioItem | null>(null);
  const [videosLoadState, setVideosLoadState] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [hiddenVideos, setHiddenVideos] = useState<Set<string>>(new Set());
  const [carouselIndex, setCarouselIndex] = useState(0);
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
      whatsapp: "",
      message: "",
    },
  });

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
    // FETCH DATA
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

    // SCROLL HANDLER
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      const bannerHeight = bannerRef.current?.offsetHeight ?? 0;

      setNavbarFixed(window.scrollY > 0 && window.scrollY >= bannerHeight);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    // CLEANUP
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // AUTO SLIDER EFFECT
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, images.length]);

  // NEXT SLIDE
  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  // PREV SLIDE
  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // TOUCH START
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  // TOUCH MOVE
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  // TOUCH END
  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;

    // SWIPE LEFT
    if (distance > 50) {
      nextSlide();
    }

    // SWIPE RIGHT
    if (distance < -50) {
      prevSlide();
    }
  };
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

  if (videosLoadState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full border-12 border-black border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading Content...</p>
        </div>
      </div>
    );
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
          <div className="w-full px-4 py-8 sm:px-6 lg:px-8 flex flex-row items-start gap-4">
            <div className="flex-1 flex flex-col items-center">
              <div className="flex flex-col gap-24 md:gap-6 sm:gap-6 lg:gap-6 w-full">
                {/* Hero — video player */}
                <div className="flex justify-center">
                  <div className="grid w-full max-w-7xl gap-6 lg:grid-cols-[10fr_2fr]">
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/70 shadow-[0_30px_120px_rgba(0,0,0,0.6)]sm:rounded-[3rem]">
                      <div className="relative aspect-[16/9] w-full">
                        {currentVideo ? (
                          // <a
                          //   href={`https://www.youtube.com/watch?v=${currentVideo.youtubeId}`}
                          //   target="_blank"
                          //   rel="noopener noreferrer"
                          //   className="flex h-full w-full items-center justify-center bg-black"
                          // >
                          //   <img
                          //     src={`https://img.youtube.com/vi/${currentVideo.youtubeId}/hqdefault.jpg`}
                          //     alt={currentVideo.title}
                          //     className="h-full w-full object-cover"
                          //   />
                          <>
                            <iframe
                              className="h-full w-full"
                              src={`https://www.youtube-nocookie.com/embed/${currentVideo.youtubeId}?rel=0&modestbranding=1`}
                              title={currentVideo.title}
                              loading="lazy"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />

                            {/* <div className="absolute inset-0 z-10 flex items-center justify-center">
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
                            </div> */}
                          </>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted/30 text-xs text-muted-foreground">
                            No video
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="group relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/70 shadow-[0_20px_80px_rgba(0,0,0,0.45)] mx-auto w-full max-w-[15rem] h-[38rem] lg:mx-0 lg:w-full lg:max-w-none lg:h-auto"
                      onMouseEnter={() => setPaused(true)}
                      onMouseLeave={() => setPaused(false)}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <div className="relative h-full min-h-full">
                        {images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Ad ${index + 1}`}
                            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                              current === index
                                ? "opacity-100 z-10"
                                : "opacity-0 z-0"
                            }`}
                          />
                        ))}

                        <div className="absolute right-2 top-2 z-20 rounded-full bg-black/70 px-2 py-1 text-[10px] text-white backdrop-blur">
                          Sponsored
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevSlide();
                          }}
                          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 px-2 py-1 text-sm text-white transition opacity-80 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-white/70"
                          aria-label="Previous ad"
                        >
                          ←
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextSlide();
                          }}
                          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 px-2 py-1 text-sm text-white transition opacity-80 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-white/70"
                          aria-label="Next ad"
                        >
                          →
                        </button>

                        <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrent(index);
                              }}
                              className={`h-2 w-2 rounded-full transition ${
                                current === index ? "bg-white" : "bg-white/40"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Portfolio */}
                <div className="flex justify-center m-auto w-[90%]">
                  <section
                    id="work"
                    className="flex flex-col justify-center items-center gap-6 text-center "
                  >
                    {/* Carousel with Navigation */}
                    {!showAllVideos && (
                      <div className="relative w-full  border border-border/60 rounded-3xl bg-card/70 shadow-[0_25px_100px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center justify-between gap-4 w-full p-2">
                          {/* Previous Button */}
                          <button
                            onClick={() => {
                              const filtered = portfolioItems.filter(
                                (item) =>
                                  item.youtubeId !== currentVideo?.youtubeId &&
                                  !hiddenVideos.has(item.youtubeId),
                              );
                              setCarouselIndex((prev) =>
                                prev === 0
                                  ? Math.max(0, filtered.length - 5)
                                  : prev - 1,
                              );
                            }}
                            className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 text-white  shadow-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/70 hover:scale-110 transition-all duration-300 flex-shrink-0 font-bold text-lg border border-sky-400/50 hover:border-sky-300 group"
                            aria-label="Previous videos"
                          >
                            <span className="group-hover:-translate-x-1 transition-transform duration-300">
                              ←
                            </span>
                          </button>

                          {/* Carousel Container */}
                          <div className="overflow-hidden flex-1">
                            <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-2">
                              {portfolioItems
                                .filter(
                                  (item) =>
                                    item.youtubeId !==
                                      currentVideo?.youtubeId &&
                                    !hiddenVideos.has(item.youtubeId),
                                )
                                .slice(carouselIndex, carouselIndex + 4)
                                .map((item) => (
                                  <button
                                    key={item.youtubeId}
                                    onClick={() => setCurrentVideo(item)}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/70 text-left shadow- shadow-black/40 transition-transform duration-150 hover:-translate-y-1 hover:border-sky-500/80 hover:shadow-xl hover:shadow-sky-500/30 cursor-pointer"
                                  >
                                    <div className="relative aspect-video w-full overflow-hidden">
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
                                          <path
                                            d="M45 24 27 14v20"
                                            fill="#fff"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                            </div>
                          </div>

                          {/* Next Button */}
                          <button
                            onClick={() => {
                              const filtered = portfolioItems.filter(
                                (item) =>
                                  item.youtubeId !== currentVideo?.youtubeId &&
                                  !hiddenVideos.has(item.youtubeId),
                              );
                              setCarouselIndex((prev) =>
                                Math.min(
                                  prev + 1,
                                  Math.max(0, filtered.length - 5),
                                ),
                              );
                            }}
                            className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/70 hover:scale-110 transition-all duration-300 flex-shrink-0 font-bold text-lg border border-sky-400/50 hover:border-sky-300 group"
                            aria-label="Next videos"
                          >
                            <span className="group-hover:translate-x-1 transition-transform duration-300">
                              →
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Grid View for All Videos */}
                    {showAllVideos && (
                      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                        {portfolioItems
                          .filter(
                            (item) =>
                              item.youtubeId !== currentVideo?.youtubeId &&
                              !hiddenVideos.has(item.youtubeId),
                          )
                          .map((item) => (
                            <button
                              key={item.youtubeId}
                              onClick={() => setCurrentVideo(item)}
                              className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/70 text-left shadow-md shadow-black/40 transition-transform duration-150 hover:-translate-y-1 hover:border-sky-500/80 hover:shadow-xl hover:shadow-sky-500/30 cursor-pointer"
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
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                    {portfolioItems.filter(
                      (item) =>
                        item.youtubeId !== currentVideo?.youtubeId &&
                        !hiddenVideos.has(item.youtubeId),
                    ).length > 5 && (
                      <button
                        onClick={() => {
                          setShowAllVideos((prev) => !prev);
                          setCarouselIndex(0);
                        }}
                        className="mt-2 rounded-full border border-border/70 px-6 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-sky-400 hover:text-sky-300"
                      >
                        {showAllVideos ? "Show less" : "Show more"}
                      </button>
                    )}
                  </section>
                </div>
                {/* Social Feeds */}

                <section
                  id="gallery"
                  className="flex flex-col items-center gap-6 text-center px-4 sm:px-8"
                >
                  <div className="space-y-2 max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
                      Gallery
                    </p>
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                      Art is the flower... life the green leaf
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      There is an eternal love between the water drop and the
                      leaf. When you look at them, you can see that they both
                      shine out of happiness.
                    </p>
                  </div>

                  <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {galleryImages.map((src, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/70 shadow-[0_20px_80px_rgba(0,0,0,0.08)]"
                      >
                        <img
                          src={src}
                          alt={`Gallery ${index + 1}`}
                          className="h-44 w-full object-cover sm:h-52 lg:h-56"
                        />
                      </div>
                    ))}
                  </div>
                </section>
                {/* <style>{`
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
            `}</style> */}
                {/* <section
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
                      <span className="[&>svg]:h-7 [&>svg]:w-7 [&>svg]:fill-[#c13584]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
              </svg>
            </span>
                    </a>
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
                </section> */}

                {/* Testimonials */}
                <section
                  id="testimonials"
                  className="flex flex-col items-center gap-6 text-center px-4 sm:px-8"
                >
                  <div className="space-y-2">
                    {/* <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
                      Kind Words
                    </p> */}
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                      What our clients say
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
                    className="w-full space-y-6 rounded-3xl border border-border/80 bg-card/80 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.65)]"
                    style={{
                      boxShadow: "0 0 0 1px hsl(210 10% 23% / 0.5)",
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2">
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
                      <div className="space-y-2 text-left">
                        <label
                          htmlFor="whatsapp"
                          className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
                        >
                          WhatsApp Number
                        </label>

                        <input
                          id="whatsapp"
                          type="tel"
                          autoComplete="tel"
                          placeholder="03001234567"
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                          {...form.register("whatsapp")}
                        />

                        {form.formState.errors.whatsapp?.message && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.whatsapp.message}
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
                  <span>Nemat TV</span>
                </div>
                <p className="max-w-md text-xs text-muted-foreground">
                  When <b>staying informed</b> matters.
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
                  © {new Date().getFullYear()} Nemat TV All rights reserved.
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
