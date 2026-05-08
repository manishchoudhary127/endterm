const CACHE_KEY = 'news_cache';
const CACHE_TIME_MS = 15 * 60 * 1000;
const API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';

const mockNews = [
  { title: "NASA's Artemis Program Hits Major Milestone", source: { name: "Space.com" }, author: "Jane Doe", publishedAt: new Date().toISOString(), urlToImage: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400", description: "Artemis II mission progressing smoothly as NASA completes crucial tests on the Orion spacecraft.", url: "#", category: "science" },
  { title: "SpaceX Starship Prepares for Next Orbital Flight", source: { name: "TechCrunch" }, author: "John Smith", publishedAt: new Date(Date.now()-3600000).toISOString(), urlToImage: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=400", description: "SpaceX is stacking the latest Starship prototype ahead of its highly anticipated orbital test flight.", url: "#", category: "technology" },
  { title: "James Webb Telescope Discovers Ancient Galaxy", source: { name: "Science Daily" }, author: "Alice Johnson", publishedAt: new Date(Date.now()-7200000).toISOString(), urlToImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400", description: "Astronomers using JWST have spotted what appears to be one of the oldest galaxies ever observed.", url: "#", category: "science" },
  { title: "New Exoplanet Found in Habitable Zone", source: { name: "Nature" }, author: "Bob Wilson", publishedAt: new Date(Date.now()-10800000).toISOString(), urlToImage: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400", description: "A rocky planet similar in size to Earth has been discovered orbiting a red dwarf star.", url: "#", category: "science" },
  { title: "Mars Rover Perseverance Collects Crucial Sample", source: { name: "NASA" }, author: "Mission Control", publishedAt: new Date(Date.now()-14400000).toISOString(), urlToImage: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400", description: "The rover has successfully cored and stored another sample from the Jezero Crater delta.", url: "#", category: "science" },
  { title: "AI Breakthrough Accelerates Drug Discovery", source: { name: "MIT Tech Review" }, author: "Sara Lee", publishedAt: new Date(Date.now()-18000000).toISOString(), urlToImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", description: "A new AI model from DeepMind can predict protein interactions at unprecedented speed.", url: "#", category: "technology" },
  { title: "Solar Storm Warning: Impact Expected This Week", source: { name: "Space Weather" }, author: "Dave Kim", publishedAt: new Date(Date.now()-21600000).toISOString(), urlToImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400", description: "NOAA forecasters warn of a G3-class geomagnetic storm that may affect GPS and radio communications.", url: "#", category: "science" },
  { title: "Global Leaders Sign Climate Tech Agreement", source: { name: "Reuters" }, author: "Emma Brown", publishedAt: new Date(Date.now()-25200000).toISOString(), urlToImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400", description: "Representatives from 50 nations signed a landmark agreement to fund clean energy research.", url: "#", category: "general" },
  { title: "Quantum Computer Achieves New Record", source: { name: "Wired" }, author: "Chris Park", publishedAt: new Date(Date.now()-28800000).toISOString(), urlToImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400", description: "IBM's 1000-qubit quantum processor solves a problem that would take classical computers millennia.", url: "#", category: "technology" },
  { title: "ISS Crew Completes Spacewalk for Solar Panel Upgrade", source: { name: "NASA" }, author: "Flight Director", publishedAt: new Date(Date.now()-32400000).toISOString(), urlToImage: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400", description: "Astronauts successfully installed new iROSA solar arrays, boosting station power capacity by 20%.", url: "#", category: "science" },
];

export async function fetchNews(category = 'science', forceRefresh = false) {
  if (!forceRefresh) {
    const cached = localStorage.getItem(`${CACHE_KEY}_${category}`);
    if (cached) {
      try {
        const { timestamp, articles } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TIME_MS) return articles;
      } catch (e) { /* ignore */ }
    }
  }

  if (!API_KEY || API_KEY === 'your_newsapi_key_here') {
    await new Promise(r => setTimeout(r, 600));
    const articles = mockNews;
    localStorage.setItem(`${CACHE_KEY}_${category}`, JSON.stringify({ timestamp: Date.now(), articles }));
    return articles;
  }

  try {
    const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=10&apikey=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();
    if (data.articles?.length > 0) {
      const articles = data.articles.map(a => ({ ...a, urlToImage: a.image, author: a.source?.name || 'Unknown', category }));
      localStorage.setItem(`${CACHE_KEY}_${category}`, JSON.stringify({ timestamp: Date.now(), articles }));
      return articles;
    }
    return mockNews;
  } catch (error) {
    console.error('News fetch error:', error);
    const cached = localStorage.getItem(`${CACHE_KEY}_${category}`);
    if (cached) return JSON.parse(cached).articles;
    return mockNews;
  }
}
