import { useState, useEffect } from "react";
import { useTheme } from "../../lib/ThemeContext";
import BASE_URL from "../../lib/api";
import axios from "axios";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    tiktok: "",
    twitter: "",
  });
  const toAbsoluteUrl = (url: string) =>
    url && !/^https?:\/\//i.test(url) ? `https://${url}` : url;
  const { theme, toggle } = useTheme();

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/social-links`)
      .then((res) =>
        setSocialLinks({
          instagram: res.data.instagram ?? "",
          facebook: res.data.facebook ?? "",
          tiktok: res.data.tiktok ?? "",
          twitter: res.data.twitter ?? "",
        }),
      )
      .catch(() => {});
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = ["Home", "Work", "Gallery", "Testimonials", "Contact"];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`transition-all duration-500 ease-out
        ${
          isScrolled
            ? "w-[90%] max-w-3xl rounded-full border border-border/50 shadow-lg backdrop-blur-md bg-background/80 py-1"
            : "w-full max-w-7xl rounded-full z-100 border border-border/50 shadow-lg backdrop-blur-md bg-background/80 py-1"
        }`}
    >
      <div className="flex items-center justify-evenly  px-6 transition-all duration-500">
        {/* Logo */}
        {/* <div className="flex items-center shrink-0">
          <a href="/" className="flex items-center">
            <div className="mr-2 h-8 w-8 rounded-full bg-foreground transition-transform duration-500 hover:scale-110"></div>
            <span className={`font-semibold tracking-wider text-foreground transition-all duration-500 ${isScrolled ? 'text-base' : 'text-lg'}`}>
              Nemat TV
            </span>
          </a>
        </div> */}

        {/* Desktop Navigation - centered */}
        <nav className="hidden md:block">
          <ul
            className={`flex items-center transition-all duration-500 ${isScrolled ? "space-x-8" : "space-x-12"}`}
          >
            {navLinks.map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => handleNavClick(e, item.toLowerCase())}
                  className={`relative group font-medium text-muted-foreground transition-all duration-300 hover:text-foreground ${isScrolled ? "text-sm" : "text-base"}`}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-foreground transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Hire Me Button (desktop) + Mobile menu toggle */}
        <div className="flex items-center gap-4 shrink-0">
          {/* <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "contact")}
            className={`hidden rounded-full ml-2 border-2 border-foreground font-medium text-foreground transition-all duration-500 hover:bg-foreground hover:text-background hover:scale-105 md:inline-block
              ${isScrolled ? "px-4 py-1 text-xs" : "px-5 py-1.5 text-sm"}`}
          >
            Let's Talk
          </a> */}

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <a
            href={
              socialLinks.instagram
                ? toAbsoluteUrl(socialLinks.instagram)
                : undefined
            }
            target={socialLinks.instagram ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={
              !socialLinks.instagram ? (e) => e.preventDefault() : undefined
            }
            aria-label="Instagram"
          >
            <span className="[&>svg]:h-6 [&>svg]:w-6 [&>svg]:fill-[#c13584]">
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
              !socialLinks.facebook ? (e) => e.preventDefault() : undefined
            }
            aria-label="Facebook"
            style={{
              opacity: socialLinks.facebook ? 1 : 0.4,
              cursor: socialLinks.facebook ? "pointer" : "not-allowed",
            }}
          >
            <span className="[&>svg]:h-6 [&>svg]:w-6 [&>svg]:fill-[#1877f2]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                {/* <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. --> */}
                <path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
              </svg>
            </span>
          </a>
          <a
            href={
              socialLinks.tiktok ? toAbsoluteUrl(socialLinks.tiktok) : undefined
            }
            target={socialLinks.tiktok ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={
              !socialLinks.tiktok ? (e) => e.preventDefault() : undefined
            }
            aria-label="Tiktok"
            style={{
              opacity: socialLinks.tiktok ? 1 : 0.4,
              cursor: socialLinks.tiktok ? "pointer" : "not-allowed",
            }}
          >
            <span className="relative inline-flex h-6 w-6">
              {/* Cyan shadow */}
              <svg
                className="absolute h-6 w-6 -translate-x-[1px] translate-y-[1px]"
                viewBox="0 0 448 512"
                fill="#25F4EE"
              >
                <path d="M448,209.9a210.1,210.1,0,0,1-122.8-39.3v178.7A162.6,162.6,0,1,1,185,188.3v89.2a74.6,74.6,0,1,0,52.2,71.2V0h88a121.2,121.2,0,0,0,1.9,22.2A122.2,122.2,0,0,0,381,93.1a121.4,121.4,0,0,0,67,20.1Z" />
              </svg>

              {/* Pink shadow */}
              <svg
                className="absolute h-6 w-6 translate-x-[1px] -translate-y-[1px]"
                viewBox="0 0 448 512"
                fill="#FE2C55"
              >
                <path d="M448,209.9a210.1,210.1,0,0,1-122.8-39.3v178.7A162.6,162.6,0,1,1,185,188.3v89.2a74.6,74.6,0,1,0,52.2,71.2V0h88a121.2,121.2,0,0,0,1.9,22.2A122.2,122.2,0,0,0,381,93.1a121.4,121.4,0,0,0,67,20.1Z" />
              </svg>

              {/* Black logo */}
              <svg
                className="absolute h-6 w-6"
                viewBox="0 0 448 512"
                fill="#000"
              >
                <path d="M448,209.9a210.1,210.1,0,0,1-122.8-39.3v178.7A162.6,162.6,0,1,1,185,188.3v89.2a74.6,74.6,0,1,0,52.2,71.2V0h88a121.2,121.2,0,0,0,1.9,22.2A122.2,122.2,0,0,0,381,93.1a121.4,121.4,0,0,0,67,20.1Z" />
              </svg>
            </span>
          </a>
          <a
            href={
              socialLinks.twitter
                ? toAbsoluteUrl(socialLinks.twitter)
                : undefined
            }
            target={socialLinks.twitter ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={
              !socialLinks.twitter ? (e) => e.preventDefault() : undefined
            }
            aria-label="Twitter"
            style={{
              opacity: socialLinks.twitter ? 1 : 0.4,
              cursor: socialLinks.twitter ? "pointer" : "not-allowed",
            }}
          >
            <span className="[&>svg]:h-6 [&>svg]:w-6 [&>svg]:fill-black">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8l164.9-188.5L26.8 48H172l100.5 132.9L389.2 48zM364.4 421.8h39.1L150.8 88.1h-42z" />
              </svg>
            </span>
          </a>
          {/* Mobile menu button */}
          <button
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <nav className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border bg-background/95 backdrop-blur-md shadow-xl md:hidden overflow-hidden">
          <ul className="flex flex-col space-y-1 p-4">
            {navLinks.map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={(e) => handleNavClick(e, item.toLowerCase())}
                >
                  {item}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="#contact"
                className="block rounded-full border-2 border-foreground bg-foreground px-5 py-2 text-center text-sm font-medium text-background transition-all hover:bg-background hover:text-foreground"
                onClick={(e) => handleNavClick(e, "contact")}
              >
                Hire Me
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
