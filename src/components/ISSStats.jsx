import React from 'react';
import { RefreshCw, Users, MapPin, Gauge, Mountain, Activity, ChevronDown } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, loading, accent }) {
  const accentColors = {
    blue: 'from-blue-500/10 to-transparent border-blue-500/20',
    green: 'from-emerald-500/10 to-transparent border-emerald-500/20',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20',
    purple: 'from-purple-500/10 to-transparent border-purple-500/20',
    cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20',
  };
  const iconColors = {
    blue: 'text-blue-500 bg-blue-500/10',
    green: 'text-emerald-500 bg-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    cyan: 'text-cyan-500 bg-cyan-500/10',
  };

  return (
    <div className={`stat-card bg-gradient-to-br ${accentColors[accent] || accentColors.blue}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconColors[accent] || iconColors.blue}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
        {label}
      </p>
      {loading ? (
        <div className="h-7 w-28 bg-[hsl(var(--muted))] animate-pulse rounded-md" />
      ) : (
        <p className="text-2xl font-display font-bold text-[hsl(var(--foreground))] leading-tight">
          {value}
        </p>
      )}
      {sub && !loading && (
        <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1 truncate">{sub}</p>
      )}
    </div>
  );
}

export function ISSStats({ position, speed, altitude, locationName, astronauts, pathLength, loading, onRefresh }) {
  const [showAstronauts, setShowAstronauts] = React.useState(false);

  return (
    <div className="space-y-4">
      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
        <StatCard
          icon={MapPin}
          label="Coordinates"
          accent="blue"
          loading={loading || !position}
          value={position ? `${position.lat.toFixed(3)}°, ${position.lng.toFixed(3)}°` : '—'}
          sub="Latitude / Longitude"
        />
        <StatCard
          icon={Gauge}
          label="Speed"
          accent="cyan"
          loading={loading}
          value={`${Math.round(speed || 0).toLocaleString()} km/h`}
          sub="Orbital velocity"
        />
        <StatCard
          icon={Mountain}
          label="Altitude"
          accent="purple"
          loading={loading}
          value={`${Math.round(altitude || 408).toLocaleString()} km`}
          sub="Above sea level"
        />
        <StatCard
          icon={MapPin}
          label="Nearest Place"
          accent="green"
          loading={loading}
          value={locationName || 'Calculating...'}
          sub="Reverse geocoded"
        />
        <StatCard
          icon={Activity}
          label="Positions Tracked"
          accent="amber"
          loading={false}
          value={(pathLength || 0).toString()}
          sub="Since page load"
        />
        {/* People in Space — special card */}
        <div className="stat-card bg-gradient-to-br from-rose-500/10 to-transparent border-rose-500/20 col-span-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg text-rose-500 bg-rose-500/10">
              <Users className="h-4 w-4" />
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted-foreground)/0.15)] transition-colors disabled:opacity-50"
              title="Refresh ISS data"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
            People in Space
          </p>
          {!astronauts ? (
            <div className="h-7 w-16 bg-[hsl(var(--muted))] animate-pulse rounded-md" />
          ) : (
            <>
              <p className="text-2xl font-display font-bold text-[hsl(var(--foreground))] leading-tight">
                {astronauts.number}
              </p>
              <button
                onClick={() => setShowAstronauts(v => !v)}
                className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))] mt-1 hover:text-[hsl(var(--primary))] transition-colors"
              >
                View crew list
                <ChevronDown className={`h-3 w-3 transition-transform ${showAstronauts ? 'rotate-180' : ''}`} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Crew List Accordion */}
      {showAstronauts && astronauts && (
        <div className="section-card p-4 animate-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
            Current Crew — {astronauts.number} people
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {astronauts.people.map((p, i) => (
              <div key={i} className="astronaut-chip justify-center text-center">
                <span className="text-[10px]">👨‍🚀</span>
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.name.split(' ').pop()}</p>
                  <p className="text-[9px] opacity-70">{p.craft}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
