import { useState, useEffect } from 'react';
import { useTheme } from '../../lib/ThemeContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['Home', 'Work', 'Socials', 'Testimonials', 'Contact'];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out
        ${isScrolled 
          ? 'w-[75%] max-w-3xl rounded-full border border-border/50 shadow-lg backdrop-blur-md bg-background/80 py-2' 
          : 'w-full max-w-7xl rounded-full border border-border/50 shadow-lg backdrop-blur-md bg-background/80 py-3'
        }`}
    >
      <div className="flex items-center justify-between px-6 transition-all duration-500">
        {/* Logo */}
        <div className="flex items-center shrink-0">
          <a href="/" className="flex items-center">
            <div className="mr-2 h-8 w-8 rounded-full bg-foreground transition-transform duration-500 hover:scale-110"></div>
            <span className={`font-semibold tracking-wider text-foreground transition-all duration-500 ${isScrolled ? 'text-base' : 'text-lg'}`}>
              LOGO
            </span>
          </a>
        </div>

        {/* Desktop Navigation - centered */}
        <nav className="hidden md:block">
          <ul className={`flex items-center transition-all duration-500 ${isScrolled ? 'space-x-8' : 'space-x-12'}`}>
            {navLinks.map((item) => (
              <li key={item}>
                <a 
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => handleNavClick(e, item.toLowerCase())}
                  className={`relative group font-medium text-muted-foreground transition-all duration-300 hover:text-foreground ${isScrolled ? 'text-sm' : 'text-base'}`}
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
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, 'contact')}
            className={`hidden rounded-full border-2 border-foreground font-medium text-foreground transition-all duration-500 hover:bg-foreground hover:text-background hover:scale-105 md:inline-block
              ${isScrolled ? 'px-4 py-1 text-xs' : 'px-5 py-1.5 text-sm'}`}
          >
            Let's Talk
          </a>

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

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
                onClick={(e) => handleNavClick(e, 'contact')}
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