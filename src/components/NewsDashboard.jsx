import React, { useState, useEffect, useMemo, useContext } from 'react';
import { fetchNews } from '../services/newsService';
import { RefreshCw, Search, ExternalLink, Calendar, User, Newspaper, AlertCircle, X } from 'lucide-react';
import { useToast } from './Toast';

const CATEGORIES = ['science', 'technology', 'general', 'health'];

export function NewsDashboard({ onNewsUpdate, externalCategoryFilter, onClearFilter }) {
  const { addToast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('science');
  const [sortBy, setSortBy] = useState('date');

  const loadNews = async (cat, force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNews(cat, force);
      setArticles(data);
      if (onNewsUpdate) onNewsUpdate(data);
      if (force) addToast({ type: 'success', title: 'News refreshed', message: `Loaded ${data.length} ${cat} articles.` });
    } catch {
      setError('Failed to load news. Please try again.');
      addToast({ type: 'error', title: 'News error', message: 'Could not fetch articles.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNews(category); }, [category]);

  const filtered = useMemo(() => {
    let result = [...articles];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.source?.name?.toLowerCase().includes(q)
      );
    }
    if (externalCategoryFilter) {
      result = result.filter(a =>
        (a.source?.name || '').toLowerCase().includes(externalCategoryFilter.toLowerCase()) ||
        (a.category || '').toLowerCase().includes(externalCategoryFilter.toLowerCase())
      );
    }
    result.sort((a, b) =>
      sortBy === 'date'
        ? new Date(b.publishedAt) - new Date(a.publishedAt)
        : (a.source?.name || '').localeCompare(b.source?.name || '')
    );
    return result.slice(0, 10);
  }, [articles, searchQuery, sortBy, externalCategoryFilter]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
              category === cat
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.15)]'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
        <button
          onClick={() => loadNews(category, true)}
          disabled={loading}
          title="Refresh"
          className="ml-auto p-1.5 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
        >
          <RefreshCw className={`h-4 w-4 text-[hsl(var(--muted-foreground))] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* External filter banner */}
      {externalCategoryFilter && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.3)] rounded-lg text-xs">
          <span className="text-[hsl(var(--primary))] font-medium">Filtered by: {externalCategoryFilter}</span>
          <button onClick={onClearFilter} className="ml-auto text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Search + Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] transition"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
        >
          <option value="date">By Date</option>
          <option value="source">By Source</option>
        </select>
      </div>

      {/* Article List */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        {loading && articles.length === 0 ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3 p-3 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--card))]">
              <div className="w-20 h-20 bg-[hsl(var(--muted))] rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 bg-[hsl(var(--muted))] rounded w-3/4" />
                <div className="h-3 bg-[hsl(var(--muted))] rounded w-full" />
                <div className="h-3 bg-[hsl(var(--muted))] rounded w-1/2" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="text-center p-6 border border-[hsl(var(--destructive)/0.3)] rounded-xl bg-[hsl(var(--destructive)/0.05)]">
            <AlertCircle className="h-8 w-8 text-[hsl(var(--destructive))] mx-auto mb-2" />
            <p className="text-sm text-[hsl(var(--destructive))] font-medium mb-3">{error}</p>
            <button
              onClick={() => loadNews(category, true)}
              className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[hsl(var(--muted-foreground))] text-sm">
            No articles match your search.
          </div>
        ) : (
          filtered.map((article, idx) => (
            <article key={idx} className="news-card group flex gap-3 p-3">
              {article.urlToImage && (
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[hsl(var(--muted))]">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="font-semibold text-xs leading-tight truncate-2 mb-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                  {article.title}
                </h3>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate-2 mb-2 flex-1 leading-snug">
                  {article.description}
                </p>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))] min-w-0">
                    <span className="flex items-center gap-0.5 truncate">
                      <Newspaper className="h-2.5 w-2.5 flex-shrink-0" />
                      {article.source?.name}
                    </span>
                    <span className="flex items-center gap-0.5 flex-shrink-0">
                      <Calendar className="h-2.5 w-2.5" />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] hover:bg-[hsl(var(--primary)/0.2)] px-2 py-1 rounded-md transition-colors"
                  >
                    Read More <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
