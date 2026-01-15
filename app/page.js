'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, X, ChevronLeft, ChevronRight, Copy, Check, TrendingUp, Globe, FileText, BarChart3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import "@flaticon/flaticon-uicons/css/all/all.css";
import './globals.css';

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

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, startDate, endDate, categoryFilter, tagFilter, countryFilter]);

  const handleCategoryClick = (catId) => { setCategoryFilter(catId.toString()); };
  const handleTagClick = (tagId) => { setTagFilter(tagId.toString()); };
  const handleCountryClick = (countryId) => { setCountryFilter(countryId.toString()); };
  const handleCountryBarClick = (data) => { if (data && data.id) setCountryFilter(data.id.toString()); };

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

  const getDateFilterLabel = () => {
    if (!startDate && !endDate) return null;
    const formatDateShort = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    if (startDate && endDate) return `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`;
    if (startDate) return `From ${formatDateShort(startDate)}`;
    if (endDate) return `Until ${formatDateShort(endDate)}`;
    return null;
  };

  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">{payload[0].value} articles</p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">{payload[0].value} articles</p>
        </div>
      );
    }
    return null;
  };

  const SkeletonLoader = () => (
    <div className="min-h-screen">
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
            <div className="animate-pulse bg-gray-300 h-6 w-32 rounded"></div>
          </div>
        </div>
      </div>
      <div className="tableau max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="animate-pulse bg-gray-200 h-4 w-24 rounded mb-2"></div>
              <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="animate-pulse bg-gray-200 h-4 w-40 rounded mb-4"></div>
              <div className="animate-pulse bg-gray-100 h-48 rounded"></div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-300 h-10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

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

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <FileText className="w-4 h-4" />
                Total Articles
              </div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.totalArticles}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                This Month
              </div>
              <div className="text-2xl font-bold text-green-600">{analyticsData.articlesThisMonth}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Globe className="w-4 h-4" />
                Top Country
              </div>
              <div className="text-lg font-bold text-blue-600 truncate" title={analyticsData.topCountry}>{analyticsData.topCountry}</div>
              <div className="text-xs text-gray-400">{analyticsData.topCountryCount} articles</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <FileText className="w-4 h-4" />
                Top Category
              </div>
              <div className="text-lg font-bold text-purple-600 truncate" title={analyticsData.topCategory}>{analyticsData.topCategory}</div>
              <div className="text-xs text-gray-400">{analyticsData.topCategoryCount} articles</div>
            </div>
          </div>

          {/* Charts */}
          {showCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Publications Timeline (12 months)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={analyticsData.timelineData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} width={30} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Countries</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.countriesChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<BarTooltip />} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(data) => handleCountryBarClick(data)}>
                      {analyticsData.countriesChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} className="hover:opacity-80 transition-opacity" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 mt-2 text-center">Click on a bar to filter by country</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-4 py-2 bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none">
              <option value="all">All categories</option>
              {Object.entries(categories).map(([id, name]) => (<option key={id} value={id}>{name}</option>))}
            </select>
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="w-full px-4 py-2 bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none">
              <option value="all">All tags</option>
              {Object.entries(tags).map(([id, name]) => (<option key={id} value={id}>{name}</option>))}
            </select>
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-full px-4 py-2 bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none">
              <option value="all">All countries</option>
              {Object.entries(countries).map(([id, name]) => (<option key={id} value={id}>{name}</option>))}
            </select>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Period:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[{ value: 'all', label: 'All' }, { value: 'week', label: '7 days' }, { value: 'month', label: '30 days' }, { value: '3months', label: '3 months' }, { value: '6months', label: '6 months' }, { value: 'year', label: '1 year' }].map((preset) => (
                  <button key={preset.value} onClick={() => applyDatePreset(preset.value)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${datePreset === preset.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>{preset.label}</button>
                ))}
              </div>
              <div className="hidden lg:block w-px h-8 bg-gray-300 mx-2"></div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">or</span>
                <input type="date" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} className="px-3 py-1.5 text-sm bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" />
                <span className="text-gray-400">→</span>
                <input type="date" value={endDate} onChange={(e) => handleEndDateChange(e.target.value)} className="px-3 py-1.5 text-sm bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm">
                  Search: &ldquo;{searchTerm}&rdquo;
                  <button onClick={() => setSearchTerm('')} className="hover:text-gray-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {getDateFilterLabel() && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  <Calendar className="w-3 h-3" />{getDateFilterLabel()}
                  <button onClick={clearDateFilter} className="hover:text-orange-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm">
                  {categories[categoryFilter]}
                  <button onClick={() => setCategoryFilter('all')} className="hover:text-gray-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {tagFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm">
                  {tags[tagFilter]}
                  <button onClick={() => setTagFilter('all')} className="hover:text-gray-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {countryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <Globe className="w-3 h-3" />{countries[countryFilter]}
                  <button onClick={() => setCountryFilter('all')} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-sm text-gray-600 hover:text-gray-900 underline ml-2">Clear all</button>
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Categories & Countries</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Excerpt</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Link</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {paginatedPosts.map((post, index) => (
                <tr key={post.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">{stripHtml(post.title.rendered)}</div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map(tagId => tags[tagId] && (
                          <button key={tagId} onClick={() => handleTagClick(tagId)} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">{tags[tagId]}</button>
                        ))}
                        {post.tags.length > 3 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">+{post.tags.length - 3}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.categories && post.categories.map(catId => categories[catId] && (
                        <button key={catId} onClick={() => handleCategoryClick(catId)} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-900 text-white hover:bg-gray-700 transition-colors cursor-pointer">{categories[catId]}</button>
                      ))}
                    </div>
                    {post.country && post.country.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.country.map(countryId => countries[countryId] && (
                          <button key={countryId} onClick={() => handleCountryClick(countryId)} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer">{countries[countryId]}</button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-600">{formatDate(post.date)}</div></td>
                  <td className="px-6 py-4"><div className="text-sm text-gray-600 line-clamp-2">{stripHtml(post?.excerpt?.rendered || '')}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button onClick={() => copyToClipboard(post.link, post.id)} className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Copy link">
                      {copiedId === post.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">Read</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-gray-50">
              <p className="text-gray-500">No articles match your search criteria.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-gray-50 px-6 py-4 rounded-lg">
            <div className="text-sm text-gray-600">Page {currentPage} of {totalPages} ({filteredPosts.length} articles)</div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />Previous
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNum ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>{pageNum}</button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-2 py-2">...</span>;
                  }
                  return null;
                })}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Next<ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}