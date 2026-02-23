"use client";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  className?: string;
}

export default function Navbar({ user, isDarkMode, onThemeToggle, className = "" }: NavbarProps) {
  return (
    <div className={`navbar fixed top-0 left-0 w-full z-50 bg-base-100 shadow-sm py-2 px-4 md:px-8 ${className}`}>
      <div className="navbar-start">
        <a className="btn btn-ghost normal-case text-xl gap-3">
          <div className="avatar">
            <div className="w-8 rounded-full">
              <img src="/logo.png" alt="Velamini Logo" />
            </div>
          </div>
          <span className="font-semibold">VELAMINI</span>
        </a>
      </div>
        
      
      <div className="navbar-end">
          <div className="flex items-center gap-3">
            <label className="toggle text-primary p-1 rounded-lg">
              <input
                type="checkbox"
                value="synthwave"
                className="theme-controller"
                checked={!!isDarkMode}
                onChange={() => onThemeToggle && onThemeToggle()}
              />

              <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </g>
              </svg>

              <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </g>
              </svg>
            </label>

            <a href="/auth/login" className="btn btn-dash btn-primary">Login</a>
          </div>
      </div>
    </div>
  );
}
