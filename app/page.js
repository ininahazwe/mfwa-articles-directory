'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import "@flaticon/flaticon-uicons/css/all/all.css";
import './globals.css';

// Analytics & UI Components
import KPICards from './components/Analytics/KPICards';
import TimelineChart from './components/Analytics/TimelineChart';
import SearchBar from './components/Filters/SearchBar';
import SelectFilters from './components/Filters/SelectFilters';
import DateFilters from './components/Filters/DateFilters';
import ActiveFilters from './components/Filters/ActiveFilters';
import ArticlesTable from './components/Table/ArticlesTable';
import Pagination from './components/Pagination';
import SkeletonLoader from './components/SkeletonLoader';

export default function WordPressPostsTable() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState({});
  const [tags, setTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [showCharts, setShowCharts] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const API_BASE = 'https://thefourthestategh.com/wp-json/wp/v2';
        
        // 1. Récupération initiale (Métadonnées + 10 premiers articles)
        const [catsRes, tagsRes, postsRes] = await Promise.all([
          fetch(`${API_BASE}/categories?per_page=100`),
          fetch(`${API_BASE}/tags?per_page=100`),
          fetch(`${API_BASE}/posts?per_page=10&page=1`)
        ]);

        if (!catsRes.ok || !tagsRes.ok || !postsRes.ok) throw new Error('Failed to fetch data');

        const catsData = await catsRes.json();
        const tagsData = await tagsRes.json();
        const initialPosts = await postsRes.json();

        // Mapping pour accès rapide
        const catsMap = {};
        catsData.forEach(c => catsMap[c.id] = c.name);
        const tagsMap = {};
        tagsData.forEach(t => tagsMap[t.id] = t.name);

        setCategories(catsMap);
        setTags(tagsMap);
        setPosts(initialPosts);
        setLoading(false);

        // 2. Chargement en arrière-plan du reste des articles (Pages 1 à 5 pour performance)
        setLoadingMore(true);
        let allFetchedPosts = [...initialPosts];
        
        // On récupère les 400 articles suivants (4 pages de 100)
        for (let i = 1; i <= 4; i++) {
          try {
            const res = await fetch(`${API_BASE}/posts?per_page=100&page=${i}`);
            if (res.ok) {
              const data = await res.json();
              allFetchedPosts = [...allFetchedPosts, ...data];
              // Tri et suppression des doublons éventuels
              const unique = Array.from(new Map(allFetchedPosts.map(p => [p.id, p])).values())
                .sort((a, b) => new Date(b.date) - new Date(a.date));
              setPosts(unique);
            }
          } catch (e) { console.error("Page fetch error", e); }
        }
        setLoadingMore(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ========== LOGIQUE DE FILTRAGE (Locale) ==========
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const title = post.title?.rendered ? post.title.rendered.toLowerCase() : '';
      const matchesSearch = title.includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || post.categories?.includes(parseInt(categoryFilter));
      const matchesTag = tagFilter === 'all' || post.tags?.includes(parseInt(tagFilter));
      
      let matchesDate = true;
      if (post.date) {
        const postDate = new Date(post.date);
        if (startDate) {
          const s = new Date(startDate); s.setHours(0,0,0,0);
          if (postDate < s) matchesDate = false;
        }
        if (endDate && matchesDate) {
          const e = new Date(endDate); e.setHours(23,59,59,999);
          if (postDate > e) matchesDate = false;
        }
      }
      return matchesSearch && matchesCategory && matchesTag && matchesDate;
    });
  }, [posts, searchTerm, categoryFilter, tagFilter, startDate, endDate]);

  // ========== ANALYTICS ==========
  const analyticsData = useMemo(() => {
    const timelineMap = {};
    const categoryCount = {};
    const now = new Date();
    const monthAgo = new Date(); monthAgo.setMonth(now.getMonth() - 1);

    filteredPosts.forEach(post => {
      // Timeline data
      const d = new Date(post.date);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      timelineMap[key] = (timelineMap[key] || 0) + 1;

      // Category data
      post.categories?.forEach(id => {
        categoryCount[id] = (categoryCount[id] || 0) + 1;
      });
    });

    const topCatId = Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b, null);

    return {
      totalArticles: filteredPosts.length,
      articlesThisMonth: filteredPosts.filter(p => new Date(p.date) >= monthAgo).length,
      topCategory: categories[topCatId] || 'N/A',
      topCategoryCount: categoryCount[topCatId] || 0,
      timelineData: Object.entries(timelineMap).map(([month, count]) => ({ month, count })).reverse().slice(-12)
    };
  }, [filteredPosts, categories]);

  // Pagination & Handlers
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  if (loading) return <SkeletonLoader />;

  const stripHtml = (html) => {
  if (!html) return '';
  // 1. Crée un document temporaire pour décoder les entités HTML (ex: &#8217; -> ')
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const decoded = doc.body.textContent || "";
  
  // 2. Supprime les éventuels caractères restants non désirés ou balises résiduelles
  return decoded.trim();
  };

  return (
    <div className="min-h-screen">
      <div className="header-container bg-white border-b border-gray-100 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <i className="fi fi-rr-book-alt text-blue-600"></i> The fourth Estate articles
          </h1>
          <div className="results-count">
            <b>{filteredPosts.length}</b> article{filteredPosts.length > 1 ? 's' : ''} found
            {loadingMore && <span className="ml-2 text-sm text-gray-500">(loading more...)</span>}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><BarChart3 size={20}/> Insights</h2>
            <button onClick={() => setShowCharts(!showCharts)} className="text-sm underline text-gray-500">
              {showCharts ? 'Hide Visuals' : 'Show Visuals'}
            </button>
          </div>
          <KPICards analyticsData={analyticsData} />
          {showCharts && <TimelineChart data={analyticsData.timelineData} />}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <SelectFilters 
              categories={categories} tags={tags} 
              categoryFilter={categoryFilter} tagFilter={tagFilter}
              onCategoryChange={setCategoryFilter} onTagChange={setTagFilter}
            />
          </div>
          <DateFilters 
            datePreset={datePreset} startDate={startDate} endDate={endDate}
            onPresetChange={(p) => setDatePreset(p)} // Vous pouvez réutiliser votre logique applyDatePreset ici
            onStartDateChange={setStartDate} onEndDateChange={setEndDate}
          />
          <ActiveFilters 
            searchTerm={searchTerm} categoryFilter={categoryFilter} tagFilter={tagFilter}
            categories={categories} tags={tags}
            onClearAll={() => {setSearchTerm(''); setCategoryFilter('all'); setTagFilter('all');}}
          />
        </div>

        <ArticlesTable 
          posts={paginatedPosts} categories={categories} tags={tags}
          copiedId={copiedId} onCopyLink={(link, id) => {
            navigator.clipboard.writeText(link); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
          }}
          formatDate={(d) => new Date(d).toLocaleDateString()}
          stripHtml={stripHtml}
          onCategoryClick={(catId) => { setCategoryFilter(catId.toString()); setCurrentPage(1); }}
          onTagClick={(tagId) => { setTagFilter(tagId.toString()); setCurrentPage(1); }}
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </main>
    </div>
  );
}