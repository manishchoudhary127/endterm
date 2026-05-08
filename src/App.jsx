import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useISSData } from './hooks/useISSData';
import { ISSMap } from './components/ISSMap';
import { ISSStats } from './components/ISSStats';
import { NewsDashboard } from './components/NewsDashboard';
import { DataCharts } from './components/DataCharts';
import { Chatbot } from './components/Chatbot';
import { ToastProvider } from './components/Toast';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const issData = useISSData();
  const [newsArticles, setNewsArticles] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const chatbotContext = {
    speed: Math.round(issData.currentSpeed || 0),
    altitude: Math.round(issData.altitude || 0),
    location: issData.locationName,
    lat: issData.position?.lat?.toFixed(4),
    lng: issData.position?.lng?.toFixed(4),
    astronautsCount: issData.astronauts?.number || 0,
    astronautNames: issData.astronauts?.people || [],
    newsArticles: newsArticles.slice(0, 10),
  };

  // Countdown progress bar
  const progressPct = issData.countdown ? ((15 - issData.countdown) / 15) * 100 : 0;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col font-sans transition-theme">
        {/* ─── HEADER ─── */}
        <header className="sticky top-0 z-50 w-full header-gradient">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-2xl" role="img" aria-label="satellite">🛰️</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight neon-text tracking-wider">
                  ISS &amp; News Hub
                </h1>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium tracking-widest uppercase">
                  Live Mission Dashboard
                </p>
              </div>
            </div>

            {/* Center status */}
            <div className="hidden md:flex items-center gap-4">
              {issData.loading ? (
                <span className="text-xs text-[hsl(var(--muted-foreground))] animate-pulse">
                  Connecting to satellite...
                </span>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="live-badge">
                    <span className="live-dot" />
                    Live Feed Active
                  </span>
                  <div className="countdown-bar w-32">
                    <div
                      className="countdown-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-xs text-[hsl(var(--muted-foreground))]">
                Refresh in <span className="font-mono font-semibold text-[hsl(var(--primary))]">{issData.countdown}s</span>
              </span>
              <button
                id="dark-mode-toggle"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Toggle dark mode"
              >
                {darkMode
                  ? <Sun className="h-4 w-4 text-[hsl(var(--star-gold,_217_91%_50%))]" />
                  : <Moon className="h-4 w-4 text-[hsl(var(--primary))]" />
                }
              </button>
            </div>
          </div>

          {/* Mobile countdown bar at bottom of header */}
          <div className="countdown-bar w-full rounded-none">
            <div className="countdown-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 container mx-auto p-4 md:p-6 grid gap-6 xl:grid-cols-12">
          {/* LEFT COLUMN */}
          <div className="xl:col-span-8 space-y-6">
            {/* ISS Stats Cards */}
            <section>
              <ISSStats
                position={issData.position}
                speed={issData.currentSpeed}
                altitude={issData.altitude}
                locationName={issData.locationName}
                astronauts={issData.astronauts}
                pathLength={issData.pathLength}
                loading={issData.loading}
                onRefresh={issData.refetch}
              />
            </section>

            {/* Live Map */}
            <section className="section-card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg neon-text">Live Trajectory</h2>
                <span className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-1 rounded-md font-mono">
                  {issData.pathLength} positions tracked
                </span>
              </div>
              <div className="h-[300px] sm:h-[420px]">
                <ISSMap
                  position={issData.position}
                  path={issData.path}
                  speed={issData.currentSpeed}
                  altitude={issData.altitude}
                  loading={issData.loading}
                  darkMode={darkMode}
                />
              </div>
            </section>

            {/* Charts */}
            <section className="section-card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg neon-text">Analytics</h2>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">Real-time data visualization</span>
              </div>
              <div className="min-h-[280px]">
                <DataCharts
                  speedHistory={issData.speedHistory}
                  newsArticles={newsArticles}
                  onCategoryFilter={setFilteredCategory}
                  activeCategory={filteredCategory}
                />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN — News */}
          <div className="xl:col-span-4">
            <section className="section-card p-4 sm:p-6 xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)] xl:flex xl:flex-col">
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <h2 className="font-display font-semibold text-lg neon-text">Global News</h2>
              </div>
              <div className="flex-1 overflow-hidden xl:overflow-y-auto custom-scrollbar">
                <NewsDashboard
                  onNewsUpdate={setNewsArticles}
                  externalCategoryFilter={filteredCategory}
                  onClearFilter={() => setFilteredCategory(null)}
                />
              </div>
            </section>
          </div>
        </main>

        {/* ─── FOOTER ─── */}
        <footer className="border-t border-[hsl(var(--border))] py-4 px-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
          <p>
            ISS position data from{' '}
            <a href="https://wheretheiss.at" target="_blank" rel="noopener noreferrer" className="underline hover:text-[hsl(var(--primary))]">Where the ISS at?</a>
            {' '} · News via GNews.io · AI powered by Meta Llama-3-8B on Hugging Face
          </p>
        </footer>

        {/* ─── CHATBOT ─── */}
        <Chatbot contextData={chatbotContext} />
      </div>
    </ToastProvider>
  );
}

export default App;
