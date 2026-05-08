import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4'];

const CustomTooltipLine = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:'hsl(var(--card))', border:'1px solid hsl(var(--border))', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
        <p style={{ color:'hsl(var(--muted-foreground))', marginBottom:2 }}>{label}</p>
        <p style={{ color:'hsl(var(--primary))', fontWeight:700 }}>{payload[0].value.toLocaleString()} km/h</p>
      </div>
    );
  }
  return null;
};

const CustomTooltipPie = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:'hsl(var(--card))', border:'1px solid hsl(var(--border))', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
        <p style={{ fontWeight:700, marginBottom:2 }}>{payload[0].name}</p>
        <p style={{ color:'hsl(var(--muted-foreground))' }}>{payload[0].value} article{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

export function DataCharts({ speedHistory, newsArticles, onCategoryFilter, activeCategory }) {
  const sourceData = useMemo(() => {
    if (!newsArticles?.length) return [];
    const counts = {};
    newsArticles.forEach(a => {
      const src = a.source?.name || 'Unknown';
      counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 6);
  }, [newsArticles]);

  const handlePieClick = (data) => {
    if (onCategoryFilter) {
      onCategoryFilter(activeCategory === data.name ? null : data.name);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Speed Line Chart */}
      <div className="bg-[hsl(var(--background))] rounded-xl border border-[hsl(var(--border))] p-4">
        <h3 className="text-sm font-semibold mb-1">ISS Speed Trend</h3>
        <p className="text-[11px] text-[hsl(var(--muted-foreground))] mb-3">Last 30 measurements (km/h)</p>
        <div style={{ height: 220 }}>
          {speedHistory?.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={speedHistory} margin={{ top:5, right:10, bottom:5, left:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={9} tick={{ fill:'hsl(var(--muted-foreground))' }} tickFormatter={v => v.split(':').slice(0,2).join(':')} interval="preserveStartEnd" />
                <YAxis domain={['auto','auto']} stroke="hsl(var(--muted-foreground))" fontSize={9} tick={{ fill:'hsl(var(--muted-foreground))' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltipLine />} />
                <Line type="monotone" dataKey="speed" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r:5, fill:'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[hsl(var(--muted-foreground))] text-sm gap-2">
              <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
              Collecting speed data...
            </div>
          )}
        </div>
      </div>

      {/* News Pie Chart */}
      <div className="bg-[hsl(var(--background))] rounded-xl border border-[hsl(var(--border))] p-4">
        <h3 className="text-sm font-semibold mb-1">News by Source</h3>
        <p className="text-[11px] text-[hsl(var(--muted-foreground))] mb-1">Click a slice to filter articles</p>
        <div style={{ height: 220 }}>
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={handlePieClick}
                  style={{ cursor: 'pointer' }}
                >
                  {sourceData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      opacity={activeCategory && activeCategory !== entry.name ? 0.4 : 1}
                      stroke={activeCategory === entry.name ? '#fff' : 'transparent'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltipPie />} />
                <Legend wrapperStyle={{ fontSize:10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[hsl(var(--muted-foreground))] text-sm">
              Loading news data...
            </div>
          )}
        </div>
        {activeCategory && (
          <p className="text-[10px] text-center text-[hsl(var(--primary))] mt-1">
            Filtered by: <strong>{activeCategory}</strong> — click slice again to clear
          </p>
        )}
      </div>
    </div>
  );
}
