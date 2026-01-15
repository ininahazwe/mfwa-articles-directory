'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import "@flaticon/flaticon-uicons/css/all/all.css";
import './globals.css';

// Analytics Components
import KPICards from './components/Analytics/KPICards';
import TimelineChart from './components/Analytics/TimelineChart';
import CountriesChart from './components/Analytics/CountriesChart';

// Filter Components
import SearchBar from './components/Filters/SearchBar';
import SelectFilters from './components/Filters/SelectFilters';
import DateFilters from './components/Filters/DateFilters';
import ActiveFilters from './components/Filters/ActiveFilters';

// Table Components
import ArticlesTable from './components/Table/ArticlesTable';
import Pagination from './components/Pagination';
import SkeletonLoader from './components/SkeletonLoader';

export default function WordPressPostsTable() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState({});
  const [tags, setTags] = useState({});
  const [countries, setCountries] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [showCharts, setShowCharts] = useState(true);
  const itemsPerPage = 10;

  // ========== DATA FETCHING ==========
  useEffect(() => {
    const fetchFirstPage = async (endpoint) => {
      try {
        const response = await fetch(`${endpoint}?per_page=100&page=1`);
        if (!response.ok) return [];
        const data = await response.json();
        return data || [];
      } catch (error) {
        return [];
      }
    };

    const fetchRemainingPages = async (endpoint, startPage = 2) => {
      let allPosts = [];
      let page = startPage;
      let hasMore = true;

      while (hasMore && page <= 10) {
        try {
          const response = await fetch(`${endpoint}?per_page=100&page=${page}`);
          if (!response.ok) break;
          const data = await response.json();
          if (!data || data.length === 0) {
            hasMore = false;
          } else {
            allPosts = [...allPosts, ...data];
            page++;
          }
        } catch (error) {
          hasMore = false;
        }
      }
      return allPosts;
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoints = [
          'https://mfwa.org/wp-json/wp/v2/posts',
          'https://mfwa.org/wp-json/wp/v2/issues-in-focus',
          'https://mfwa.org/wp-json/wp/v2/country-highlights',
          'https://mfwa.org/wp-json/wp/v2/partner-highlights',
          'https://mfwa.org/wp-json/wp/v2/publication'
        ];
        
        const [categoriesResponse, tagsResponse, countriesResponse, firstBatchResponse] = await Promise.all([
          fetch('https://mfwa.org/wp-json/wp/v2/categories?per_page=100'),
          fetch('https://mfwa.org/wp-json/wp/v2/tags?per_page=100'),
          fetch('https://mfwa.org/wp-json/wp/v2/country?per_page=100'),
          fetch(`${endpoints[0]}?per_page=10&page=1`)
        ]);
        
        if (!categoriesResponse.ok || !tagsResponse.ok || !countriesResponse.ok || !firstBatchResponse.ok) {
          throw new Error('Error fetching data');
        }
        
        const categoriesData = await categoriesResponse.json();
        const tagsData = await tagsResponse.json();
        const countriesData = await countriesResponse.json();
        const firstBatch = await firstBatchResponse.json();
        
        const categoriesMap = {};
        categoriesData.forEach(cat => { categoriesMap[cat.id] = cat.name; });
        
        const tagsMap = {};
        tagsData.forEach(tag => { tagsMap[tag.id] = tag.name; });
        
        const countriesMap = {};
        countriesData.forEach(country => { countriesMap[country.id] = country.name; });
        
        setPosts(firstBatch);
        setCategories(categoriesMap);
        setTags(tagsMap);
        setCountries(countriesMap);
        setError(null);
        setLoading(false);
        
        setLoadingMore(true);
        const firstPagePromises = endpoints.map(endpoint => fetchFirstPage(endpoint));
        const firstPages = await Promise.all(firstPagePromises);
        const allFirstPages = firstPages.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(allFirstPages);
        
        const remainingPromises = endpoints.map(endpoint => fetchRemainingPages(endpoint));
        const remainingPages = await Promise.all(remainingPromises);
        const allPosts = [...allFirstPages, ...remainingPages.flat()].sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(allPosts);
        setLoadingMore(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ========== UTILITY FUNCTIONS ==========
  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const copyToClipboard = async (link, postId) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Error copying:', err);
    }
  };

  // ========== DATE HANDLING ==========
  const applyDatePreset = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    let start = '';
    let end = now.toISOString().split('T')[0];

    switch (preset) {
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        break;
      case 'month':
        start = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
        break;
      case '3months':
        start = new Date(now.setMonth(now.getMonth() - 3)).toISOString().split('T')[0];
        break;
      case '6months':
        start = new Date(now.setMonth(now.getMonth() - 6)).toISOString().split('T')[0];
        break;
      case 'year':
        start = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
        break;
      case 'all':
      default:
        start = '';
        end = '';
        break;
    }
    setStartDate(start);
    setEndDate(end);
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
    setDatePreset('custom');
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
    setDatePreset('custom');
  };

  const getDateFilterLabel = () => {
    if (!startDate && !endDate) return null;
    const formatDateShort = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    if (startDate && endDate) return `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`;
    if (startDate) return `From ${formatDateShort(startDate)}`;
    if (endDate) return `Until ${formatDateShort(endDate)}`;
    return null;
  };

  // ========== FILTERING ==========
  const filteredPosts = posts.filter(post => {
    const title = post?.title?.rendered ? stripHtml(post.title.rendered).toLowerCase() : '';
    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || (post.categories && post.categories.includes(parseInt(categoryFilter)));
    const matchesTag = tagFilter === 'all' || (post.tags && post.tags.includes(parseInt(tagFilter)));
    const matchesCountry = countryFilter === 'all' || (post.country && post.country.includes(parseInt(countryFilter)));
    
    let matchesDate = true;
    if (post.date) {
      const postDate = new Date(post.date);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (postDate < start) matchesDate = false;
      }
      if (endDate && matchesDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (postDate > end) matchesDate = false;
      }
    }
    return matchesSearch && matchesCategory && matchesTag && matchesCountry && matchesDate;
  });

  // ========== ANALYTICS ==========
  const analyticsData = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const articlesThisMonth = filteredPosts.filter(post => new Date(post.date) >= thisMonthStart).length;

    const countryCount = {};
    filteredPosts.forEach(post => {
      if (post.country && post.country.length > 0) {
        post.country.forEach(countryId => {
          countryCount[countryId] = (countryCount[countryId] || 0) + 1;
        });
      }
    });
    
    const topCountryId = Object.keys(countryCount).reduce((a, b) => countryCount[a] > countryCount[b] ? a : b, null);
    const topCountry = topCountryId ? countries[topCountryId] : 'N/A';
    const topCountryCount = topCountryId ? countryCount[topCountryId] : 0;

    const categoryCount = {};
    filteredPosts.forEach(post => {
      if (post.categories && post.categories.length > 0) {
        post.categories.forEach(catId => {
          categoryCount[catId] = (categoryCount[catId] || 0) + 1;
        });
      }
    });
    
    const topCategoryId = Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b, null);
    const topCategory = topCategoryId ? categories[topCategoryId] : 'N/A';
    const topCategoryCount = topCategoryId ? categoryCount[topCategoryId] : 0;

    const timelineData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const count = filteredPosts.filter(post => {
        const postDate = new Date(post.date);
        return postDate >= monthStart && postDate <= monthEnd;
      }).length;
      timelineData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count,
        fullDate: monthStart
      });
    }

    const countriesChartData = Object.entries(countryCount)
      .map(([id, count]) => ({ id, name: countries[id] || 'Unknown', count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return { totalArticles: filteredPosts.length, articlesThisMonth, topCountry, topCountryCount, topCategory, topCategoryCount, timelineData, countriesChartData };
  }, [filteredPosts, countries, categories]);

  // ========== PAGINATION ==========
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, startDate, endDate, categoryFilter, tagFilter, countryFilter]);

  // ========== EVENT HANDLERS ==========
  const handleCategoryClick = (catId) => setCategoryFilter(catId.toString());
  const handleTagClick = (tagId) => setTagFilter(tagId.toString());
  const handleCountryClick = (countryId) => setCountryFilter(countryId.toString());

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setDatePreset('all');
    setCategoryFilter('all');
    setTagFilter('all');
    setCountryFilter('all');
    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setDatePreset('all');
  };

  const hasActiveFilters = searchTerm || startDate || endDate || categoryFilter !== 'all' || tagFilter !== 'all' || countryFilter !== 'all';

  // ========== RENDER ==========
  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 rounded-lg p-6 max-w-md">
          <p className="text-red-900 font-semibold">Error</p>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="header-container">
        <div className="header-content">
          <div className="logo-text">
            <div className="icon-wrapper">
              <div className="icon-circle"></div>
              <i className="fi fi-rr-book-alt"></i>
            </div>
            <h1>Articles Directory</h1>
          </div>
          <div className="results-count">
            <b>{filteredPosts.length}</b> article{filteredPosts.length > 1 ? 's' : ''} found
            {loadingMore && <span className="ml-2 text-sm text-gray-500">(loading more...)</span>}
          </div>
        </div>
      </div>
      

      <div className="tableau max-w-7xl mx-auto px-8 py-8">
        {/* Analytics Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics
              {hasActiveFilters && <span className="text-sm font-normal text-gray-500">(filtered results)</span>}
            </h2>
            <button onClick={() => setShowCharts(!showCharts)} className="text-sm text-gray-600 hover:text-gray-900 underline">
              {showCharts ? 'Hide charts' : 'Show charts'}
            </button>
          </div>

          <KPICards analyticsData={analyticsData} />

          {showCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TimelineChart data={analyticsData.timelineData} />
              <CountriesChart data={analyticsData.countriesChartData} onCountryClick={handleCountryClick} />
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <SelectFilters
              categories={categories}
              tags={tags}
              countries={countries}
              categoryFilter={categoryFilter}
              tagFilter={tagFilter}
              countryFilter={countryFilter}
              onCategoryChange={setCategoryFilter}
              onTagChange={setTagFilter}
              onCountryChange={setCountryFilter}
            />
          </div>

          <DateFilters
            datePreset={datePreset}
            startDate={startDate}
            endDate={endDate}
            onPresetChange={applyDatePreset}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />

          <ActiveFilters
            searchTerm={searchTerm}
            dateFilterLabel={getDateFilterLabel()}
            categoryFilter={categoryFilter}
            tagFilter={tagFilter}
            countryFilter={countryFilter}
            categories={categories}
            tags={tags}
            countries={countries}
            onClearSearch={() => setSearchTerm('')}
            onClearDate={clearDateFilter}
            onClearCategory={() => setCategoryFilter('all')}
            onClearTag={() => setTagFilter('all')}
            onClearCountry={() => setCountryFilter('all')}
            onClearAll={clearFilters}
          />
        </div>

        {/* Table Section */}
        <ArticlesTable
          posts={paginatedPosts}
          categories={categories}
          tags={tags}
          countries={countries}
          copiedId={copiedId}
          onCategoryClick={handleCategoryClick}
          onTagClick={handleTagClick}
          onCountryClick={handleCountryClick}
          onCopyLink={copyToClipboard}
          formatDate={formatDate}
          stripHtml={stripHtml}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPosts.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}