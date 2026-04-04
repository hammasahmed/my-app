import { Link } from "react-router-dom";
import {
  Download,
  Home,
  Moon,
  RefreshCw,
  Sparkles,
  Sun,
  Video,
  Wrench,
} from "lucide-react";
import { AppSidebar } from "../components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import axios from "axios";
import { use, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Textarea } from "../components/ui/textarea";

type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

type TestimonialItem = {
  _id?: string;
  name: string;
  designation: string;
  quote: string;
  src: string;
};

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

export default function Dashboard1() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<PortfolioItem | null>(null);
  const [videosLoadState, setVideosLoadState] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [dark, setDark] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [testimonialForm, setTestimonialForm] = useState({ name: "", designation: "", quote: "", src: "" });
  const [testimonialSubmitting, setTestimonialSubmitting] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [hiddenVideos, setHiddenVideos] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [socialLinks, setSocialLinks] = useState({ instagram: "", facebook: "" });
  const [socialSaving, setSocialSaving] = useState(false);

  const fetchHiddenVideos = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/hidden-videos");
      setHiddenVideos(new Set(res.data));
    } catch {}
  };

  const fetchSocialLinks = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/social-links");
      setSocialLinks({ instagram: res.data.instagram ?? "", facebook: res.data.facebook ?? "" });
    } catch {}
  };

  const handleSaveSocialLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setSocialSaving(true);
    try {
      await axios.put("http://localhost:4000/api/social-links", socialLinks);
    } catch {}
    setSocialSaving(false);
  };

  const toggleHide = async (youtubeId: string) => {
    if (hiddenVideos.has(youtubeId)) {
      await axios.delete(`http://localhost:4000/api/hidden-videos/${youtubeId}`).catch(() => {});
      setHiddenVideos((prev) => { const next = new Set(prev); next.delete(youtubeId); return next; });
    } else {
      await axios.post("http://localhost:4000/api/hidden-videos", { youtubeId }).catch(() => {});
      setHiddenVideos((prev) => new Set(prev).add(youtubeId));
    }
  };

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  const fetchContactMessages = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/contact");
      setContactMessages(res.data);
    } catch {}
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await axios.delete(`http://localhost:4000/api/contact/${id}`);
      setContactMessages((prev) => prev.filter((m) => m._id !== id));
    } catch {}
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setTestimonialForm((p) => ({ ...p, src: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/testimonials");
      setTestimonials(res.data);
    } catch {}
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonialSubmitting(true);
    try {
      const res = await axios.post("http://localhost:4000/api/testimonials", testimonialForm);
      setTestimonials((prev) => [res.data, ...prev]);
      setTestimonialForm({ name: "", designation: "", quote: "", src: "" });
    } catch {}
    setTestimonialSubmitting(false);
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      await axios.delete(`http://localhost:4000/api/testimonials/${id}`);
      setTestimonials((prev) => prev.filter((t) => t._id !== id));
    } catch {}
  };

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

  useEffect(() => {
    datafetch();
    fetchTestimonials();
    fetchContactMessages();
    fetchHiddenVideos();
    fetchSocialLinks();
  }, []);
  return (
    <div className={`min-h-svh w-full ${dark ? "bg-[#141414] text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      {/* Ambient glow — dark mode only */}
      {dark && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-40 left-1/2 h-[480px] w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.12),transparent_55%)]" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />
        </div>
      )}

      <SidebarProvider
        className="relative z-10 min-h-svh"
        style={{
          "--sidebar": dark ? "oklch(0.13 0 0)" : "oklch(1 0 0)",
          "--sidebar-foreground": dark ? "oklch(0.985 0 0)" : "oklch(0.145 0 0)",
          "--sidebar-accent": dark ? "oklch(0.269 0 0)" : "oklch(0.97 0 0)",
          "--sidebar-accent-foreground": dark ? "oklch(0.985 0 0)" : "oklch(0.205 0 0)",
          "--sidebar-border": dark ? "oklch(1 0 0 / 10%)" : "oklch(0.922 0 0)",
          "--sidebar-primary": dark ? "oklch(0.488 0.243 264.376)" : "oklch(0.205 0 0)",
          "--sidebar-primary-foreground": dark ? "oklch(0.985 0 0)" : "oklch(0.985 0 0)",
        } as React.CSSProperties}
      >
        <AppSidebar
          variant="inset"
          className={`border-r ${dark ? "border-white/10 bg-zinc-950/90" : "border-zinc-200 bg-white"} backdrop-blur-sm`}
        />
        <SidebarInset className={`flex min-h-svh flex-col overflow-x-hidden ${dark ? "bg-transparent" : "bg-zinc-50"}`}>
          <header className={`sticky top-0 z-20 flex min-h-16 shrink-0 flex-wrap items-center gap-3 border-b px-3 py-3 backdrop-blur-md sm:gap-4 sm:px-4 md:min-h-14 md:flex-nowrap md:justify-between ${dark ? "border-white/10 bg-zinc-950/80" : "border-zinc-200 bg-white"}`}>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
              <SidebarTrigger className={`-ml-0.5 shrink-0 border ${dark ? "border-white/15 bg-zinc-900/80 text-zinc-100 hover:bg-zinc-800 hover:text-white" : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100"}`} />
              <Separator
                orientation="vertical"
                className={`hidden h-6 shrink-0 sm:block ${dark ? "data-[orientation=vertical]:bg-white/15" : "data-[orientation=vertical]:bg-zinc-200"}`}
              />
              <Breadcrumb className="min-w-0">
                <BreadcrumbList className="flex-wrap gap-x-2 gap-y-1">
                  <BreadcrumbItem className="hidden sm:list-item">
                    <BreadcrumbLink
                      href="/"
                      className={`text-xs font-medium ${dark ? "text-sky-400/90 hover:text-sky-300" : "text-sky-600 hover:text-sky-500"}`}
                    >
                      Studio
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className={`hidden sm:block ${dark ? "[&>svg]:text-zinc-500" : "[&>svg]:text-zinc-400"}`} />
                  <BreadcrumbItem>
                    <BreadcrumbPage className={`truncate text-xs font-medium ${dark ? "text-zinc-100" : "text-zinc-800"}`}>
                      Dashboard
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setDark(!dark)}
                className={`relative flex h-8 w-16 items-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  dark ? "bg-zinc-700" : "bg-zinc-200"
                }`}
                aria-label="Toggle dark mode"
              >
                <span
                  className={`absolute flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-all duration-300 ${
                    dark
                      ? "translate-x-8 bg-zinc-900 text-yellow-400"
                      : "translate-x-0 bg-white text-zinc-500"
                  }`}
                >
                  {dark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
                </span>
              </button>
              <Button
                variant="outline"
                size="sm"
                className={`${dark ? "border-sky-500/40 bg-zinc-900/60 text-zinc-100 shadow-sm shadow-sky-500/10 hover:border-sky-400/70 hover:bg-zinc-800 hover:text-white" : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100"}`}
                asChild
              >
                <Link to="/" className="gap-1.5">
                  <Home className="size-4 shrink-0" />
                  <span className="hidden sm:inline">View site</span>
                </Link>
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                type="button"
                className="border-white/15 bg-zinc-900/60 text-zinc-100 hover:border-sky-500/50 hover:bg-zinc-800 hover:text-white"
              >
                <RefreshCw className="mr-1.5 size-4 shrink-0" />
                <span className="hidden sm:inline">Sync</span>
              </Button>
              <Button
                size="sm"
                type="button"
                className="bg-gradient-to-r from-sky-500 to-violet-600 font-semibold text-white shadow-lg shadow-sky-500/25 hover:brightness-110"
              >
                <Download className="mr-1.5 size-4 shrink-0" />
                <span className="hidden sm:inline">Export</span>
              </Button> */}
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6 p-4 pt-5 sm:p-6">
            <div className="space-y-2 text-center sm:text-left">
              {/* <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
                Control center
              </p> */}
              <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${dark ? "text-zinc-50" : "text-zinc-900"}`}>
                Dashboard
              </h1>
            </div>

            {/* <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Videos",
                  value: "—",
                  hint: "Playlist & embeds",
                  icon: Video,
                  accent: "from-sky-500/20 to-transparent",
                },
                {
                  title: "Quick tools",
                  value: "Ready",
                  hint: "Imports & API",
                  icon: Wrench,
                  accent: "from-violet-500/20 to-transparent",
                },
                {
                  title: "Highlights",
                  value: "New",
                  hint: "Featured slot",
                  icon: Sparkles,
                  accent: "from-emerald-500/15 to-transparent",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] transition hover:border-sky-500/40"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-80`}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        {card.title}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-zinc-50">
                        {card.value}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">{card.hint}</p>
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-950/80 text-sky-400 shadow-inner">
                      <card.icon className="size-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div> */}

            <div id="videos-section" className={`flex min-h-[min(60vh,520px)] flex-1 flex-col rounded-3xl border p-6 backdrop-blur-sm md:min-h-0 ${dark ? "border-white/10 bg-zinc-900/40 shadow-[0_30px_120px_rgba(0,0,0,0.5)]" : "border-zinc-200 bg-white shadow-sm"}`}>
              <div className={`mb-4 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between ${dark ? "border-white/10" : "border-zinc-200"}`}>
                <div>
                  <h2 className={`text-lg font-semibold ${dark ? "text-zinc-50" : "text-zinc-900"}`}>
                    Your Youtube Videos
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/15 bg-zinc-950/60 text-zinc-200 hover:border-sky-500/50 hover:bg-zinc-800 hover:text-white"
                  >
                    Filters
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/15 bg-zinc-950/60 text-zinc-200 hover:border-sky-500/50 hover:bg-zinc-800 hover:text-white"
                  >
                    Columns
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-sky-600 text-white hover:bg-sky-500"
                  >
                    Add row
                  </Button> */}
                </div>
              </div>
              {hiddenVideos.size > 0 && (
                <div className="mb-3 flex w-full justify-end">
                  <button
                    type="button"
                    onClick={() => setShowHidden((v) => !v)}
                    className={`text-xs font-medium underline-offset-2 hover:underline ${dark ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    {showHidden ? "Hide hidden videos" : `Show hidden (${hiddenVideos.size})`}
                  </button>
                </div>
              )}
              <div className={`rounded-2xl border border-dashed p-4 ${dark ? "border-white/10 bg-zinc-950/30" : "border-zinc-200 bg-zinc-50"}`}>
                <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {(showAllVideos
                    ? portfolioItems
                    : portfolioItems.filter((item) => showHidden || !hiddenVideos.has(item.youtubeId)).slice(0, 6)
                  )
                    .filter((item) => showHidden || !hiddenVideos.has(item.youtubeId))
                    .map((item) => (
                    <div key={item.youtubeId}>
                      <a
                        href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex flex-col overflow-hidden rounded-2xl border text-left shadow-md transition-transform duration-150 hover:-translate-y-1 hover:border-sky-500/80 hover:shadow-xl hover:shadow-sky-500/30 h-[270px] ${hiddenVideos.has(item.youtubeId) ? "opacity-40" : ""} ${dark ? "border-white/10 bg-zinc-900 shadow-black/40" : "border-zinc-200 bg-white shadow-zinc-200"}`}
                      >
                        <div className="relative aspect-video overflow-hidden ">
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
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sky-400 shadow-lg transition group-hover:scale-110 ${dark ? "bg-zinc-900/80 shadow-black/60 group-hover:bg-zinc-900" : "bg-white/90 shadow-black/20 group-hover:bg-white"}`}>
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
                          <h3 className={`text-sm font-semibold ${dark ? "text-zinc-100" : "text-zinc-900"}`}>
                            {item.title}
                          </h3>
                          <p className={`text-xs ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                            {item.description}
                          </p>
                        </div>
                      </a>
                      <Button
                        type="button"
                        size="lg"
                        onClick={() => toggleHide(item.youtubeId)}
                        className={`w-full mt-2 text-white ${hiddenVideos.has(item.youtubeId) ? "bg-zinc-600 hover:bg-zinc-500" : "bg-red-600 hover:bg-red-700"}`}
                      >
                        {hiddenVideos.has(item.youtubeId) ? "Unhide" : "Hide"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
{(() => { const visible = portfolioItems.filter((item) => !hiddenVideos.has(item.youtubeId)); return visible.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllVideos((v) => !v)}
                  className={`mt-4 self-center text-sm font-medium underline-offset-2 hover:underline ${dark ? "text-sky-400" : "text-sky-600"}`}
                >
                  {showAllVideos ? "Show less" : `Show more (${portfolioItems.filter((item) => !hiddenVideos.has(item.youtubeId)).length - 6} more)`}
                </button>
              ); })()}
            </div>

            {/* Social Links Section */}
            <div className={`flex flex-col rounded-3xl border p-6 backdrop-blur-sm ${dark ? "border-white/10 bg-zinc-900/40 shadow-[0_30px_120px_rgba(0,0,0,0.5)]" : "border-zinc-200 bg-white shadow-sm"}`}>
              <div className={`mb-4 flex items-center justify-between border-b pb-4 ${dark ? "border-white/10" : "border-zinc-200"}`}>
                <h2 className={`text-lg font-semibold ${dark ? "text-zinc-50" : "text-zinc-900"}`}>Social Links</h2>
              </div>
              <form onSubmit={handleSaveSocialLinks} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className={`text-xs font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`}>Instagram URL</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/yourhandle"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks((p) => ({ ...p, instagram: e.target.value }))}
                    className={`rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${dark ? "border-white/15 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500" : "border-zinc-200 bg-white text-zinc-900"}`}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={`text-xs font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`}>Facebook URL</label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/yourpage"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks((p) => ({ ...p, facebook: e.target.value }))}
                    className={`rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${dark ? "border-white/15 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500" : "border-zinc-200 bg-white text-zinc-900"}`}
                  />
                </div>
                <Button type="submit" disabled={socialSaving} className="self-start bg-sky-600 text-white hover:bg-sky-500">
                  {socialSaving ? "Saving..." : "Save Links"}
                </Button>
              </form>
            </div>

            {/* Contact Messages Section */}
            <div id="contact-section" className={`flex flex-col rounded-3xl border p-6 backdrop-blur-sm ${dark ? "border-white/10 bg-zinc-900/40 shadow-[0_30px_120px_rgba(0,0,0,0.5)]" : "border-zinc-200 bg-white shadow-sm"}`}>
              <div className={`mb-4 flex items-center justify-between border-b pb-4 ${dark ? "border-white/10" : "border-zinc-200"}`}>
                <h2 className={`text-lg font-semibold ${dark ? "text-zinc-50" : "text-zinc-900"}`}>Contact Messages</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${dark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>{contactMessages.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {contactMessages.length === 0 && (
                  <p className={`text-center text-sm ${dark ? "text-zinc-500" : "text-zinc-400"}`}>No messages yet.</p>
                )}
                {contactMessages.map((m) => (
                  <div key={m._id} className={`relative rounded-2xl border p-4 ${dark ? "border-white/10 bg-zinc-950/50" : "border-zinc-200 bg-zinc-50"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className={`text-sm font-semibold ${dark ? "text-zinc-100" : "text-zinc-900"}`}>{m.name}</p>
                        <p className={`text-xs ${dark ? "text-sky-400" : "text-sky-600"}`}>{m.email}</p>
                        <p className={`text-xs leading-relaxed mt-2 ${dark ? "text-zinc-300" : "text-zinc-600"}`}>{m.message}</p>
                        <p className={`text-[10px] mt-1 ${dark ? "text-zinc-600" : "text-zinc-400"}`}>{new Date(m.createdAt).toLocaleString()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m._id)}
                        className="shrink-0 text-red-400 hover:text-red-300"
                        aria-label="Delete message"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials Section */}
            <div id="testimonials-section" className={`flex flex-col rounded-3xl border p-6 backdrop-blur-sm ${dark ? "border-white/10 bg-zinc-900/40 shadow-[0_30px_120px_rgba(0,0,0,0.5)]" : "border-zinc-200 bg-white shadow-sm"}`}>
              <div className={`mb-4 flex items-center justify-between border-b pb-4 ${dark ? "border-white/10" : "border-zinc-200"}`}>
                <h2 className={`text-lg font-semibold ${dark ? "text-zinc-50" : "text-zinc-900"}`}>Testimonials</h2>
              </div>

              {/* Add Testimonial Form */}
              <form onSubmit={handleAddTestimonial} className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  placeholder="Name"
                  value={testimonialForm.name}
                  onChange={(e) => setTestimonialForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  className={`rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${dark ? "border-white/15 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500" : "border-zinc-200 bg-white text-zinc-900"}`}
                />
                <input
                  placeholder="Designation"
                  value={testimonialForm.designation}
                  onChange={(e) => setTestimonialForm((p) => ({ ...p, designation: e.target.value }))}
                  required
                  className={`rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${dark ? "border-white/15 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500" : "border-zinc-200 bg-white text-zinc-900"}`}
                />
                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`}>Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    required={!testimonialForm.src}
                    onChange={handleImageChange}
                    className={`text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-medium cursor-pointer ${
                      dark
                        ? "text-zinc-300 file:bg-zinc-700 file:text-zinc-100"
                        : "text-zinc-700 file:bg-zinc-100 file:text-zinc-700"
                    }`}
                  />
                  {testimonialForm.src && (
                    <img src={testimonialForm.src} alt="preview" className="h-12 w-12 rounded-full object-cover" />
                  )}
                </div>
                <Textarea
                  placeholder="Quote"
                  value={testimonialForm.quote}
                  onChange={(e) => setTestimonialForm((p) => ({ ...p, quote: e.target.value }))}
                  required
                  className={dark ? "border-white/15 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500" : ""}
                />
                <Button
                  type="submit"
                  disabled={testimonialSubmitting}
                  className="sm:col-span-2 bg-sky-600 text-white hover:bg-sky-500"
                >
                  {testimonialSubmitting ? "Adding..." : "Add Testimonial"}
                </Button>
              </form>

              {/* Testimonials List */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.length === 0 && (
                  <p className={`col-span-full text-center text-sm ${dark ? "text-zinc-500" : "text-zinc-400"}`}>No testimonials yet.</p>
                )}
                {testimonials.map((t) => (
                  <div key={t._id} className={`relative flex flex-col gap-2 rounded-2xl border p-4 ${dark ? "border-white/10 bg-zinc-950/50" : "border-zinc-200 bg-zinc-50"}`}>
                    <div className="flex items-center gap-3">
                      <img src={t.src} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className={`text-sm font-semibold ${dark ? "text-zinc-100" : "text-zinc-900"}`}>{t.name}</p>
                        <p className={`text-xs ${dark ? "text-zinc-400" : "text-zinc-500"}`}>{t.designation}</p>
                      </div>
                    </div>
                    <p className={`text-xs leading-relaxed ${dark ? "text-zinc-300" : "text-zinc-600"}`}>{t.quote}</p>
                    <button
                      type="button"
                      onClick={() => t._id && handleDeleteTestimonial(t._id)}
                      className="absolute right-3 top-3 text-red-400 hover:text-red-300"
                      aria-label="Delete testimonial"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
