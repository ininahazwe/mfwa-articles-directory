'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, X, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
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
  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
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
        
        // Charger catÃ©gories et tags + seulement 10 premiers articles
        const [categoriesResponse, tagsResponse, countriesResponse, firstBatchResponse] = await Promise.all([
          fetch('https://mfwa.org/wp-json/wp/v2/categories?per_page=100'),
          fetch('https://mfwa.org/wp-json/wp/v2/tags?per_page=100'),
          fetch('https://mfwa.org/wp-json/wp/v2/country?per_page=100'),
          fetch(`${endpoints[0]}?per_page=10&page=1`)
        ]);
        
        if (!categoriesResponse.ok || !tagsResponse.ok || !countriesResponse.ok || !firstBatchResponse.ok) {
          throw new Error('Erreur lors de la rÃ©cupÃ©ration des donnÃ©es');
        }
        
        const categoriesData = await categoriesResponse.json();
        const tagsData = await tagsResponse.json();
        const countriesData = await countriesResponse.json();
        const firstBatch = await firstBatchResponse.json();
        
        const categoriesMap = {};
        categoriesData.forEach(cat => {
          categoriesMap[cat.id] = cat.name;
        });
        
        const tagsMap = {};
        tagsData.forEach(tag => {
          tagsMap[tag.id] = tag.name;
        });
        
        const countriesMap = {};
        countriesData.forEach(country => {
          countriesMap[country.id] = country.name;
        });
        
        // Afficher immÃ©diatement les 10 premiers articles
        setPosts(firstBatch);
        setCategories(categoriesMap);
        setTags(tagsMap);
        setCountries(countriesMap);
        setError(null);
        setLoading(false);
        
        // Charger le reste en arriÃ¨re-plan
        setLoadingMore(true);
        
        // Charger toutes les premiÃ¨res pages de tous les endpoints
        const firstPagePromises = endpoints.map(endpoint => fetchFirstPage(endpoint));
        const firstPages = await Promise.all(firstPagePromises);
        const allFirstPages = firstPages.flat().sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
        setPosts(allFirstPages);
        
        // Charger les pages restantes
        const remainingPromises = endpoints.map(endpoint => fetchRemainingPages(endpoint));
        const remainingPages = await Promise.all(remainingPromises);
        
        const allPosts = [...allFirstPages, ...remainingPages.flat()].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
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
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const copyToClipboard = async (link, postId) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const filteredPosts = posts.filter(post => {
    const title = post?.title?.rendered ? stripHtml(post.title.rendered).toLowerCase() : '';
    const matchesSearch = title.includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
                           (post.categories && post.categories.includes(parseInt(categoryFilter)));
    
    const matchesTag = tagFilter === 'all' || 
                      (post.tags && post.tags.includes(parseInt(tagFilter)));
    
    const matchesCountry = countryFilter === 'all' || 
                          (post.country && post.country.includes(parseInt(countryFilter)));
    
    let matchesDate = true;
    if (dateFilter !== 'all' && post.date) {
      const postDate = new Date(post.date);
      const now = new Date();
      const daysDiff = (now - postDate) / (1000 * 60 * 60 * 24);
      
      if (dateFilter === 'week') matchesDate = daysDiff <= 7;
      else if (dateFilter === 'month') matchesDate = daysDiff <= 30;
      else if (dateFilter === 'year') matchesDate = daysDiff <= 365;
    }
    
    return matchesSearch && matchesCategory && matchesTag && matchesCountry && matchesDate;
  });

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, categoryFilter, tagFilter, countryFilter]);

  const handleCategoryClick = (catId) => {
    setCategoryFilter(catId.toString());
  };

  const handleTagClick = (tagId) => {
    setTagFilter(tagId.toString());
  };

  const handleCountryClick = (countryId) => {
    setCountryFilter(countryId.toString());
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setCategoryFilter('all');
    setTagFilter('all');
    setCountryFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || dateFilter !== 'all' || categoryFilter !== 'all' || tagFilter !== 'all' || countryFilter !== 'all';

  const SkeletonLoader = () => (
    <div 
      className="min-h-screen"
      /* style={{ 
       background: 'linear-gradient(135deg, #FFE5D9 0%, #FFF5F0 25%, #FFFFFF 50%, #F0F8FF 75%, #E0F4FF 100%)'
      }} */
    >
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
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-300 h-10 rounded-lg"></div>
            ))}
          </div>
        </div>

        <div className="bg-white overflow-hidden mb-8 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">CatÃ©gories</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Extrait</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Lien</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {[...Array(10)].map((_, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-300 h-4 w-3/4 rounded mb-2"></div>
                    <div className="flex gap-1">
                      <div className="animate-pulse bg-gray-200 h-5 w-16 rounded-full"></div>
                      <div className="animate-pulse bg-gray-200 h-5 w-20 rounded-full"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-300 h-6 w-24 rounded-full"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-300 h-4 w-32 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-300 h-4 w-full rounded mb-1"></div>
                    <div className="animate-pulse bg-gray-300 h-4 w-5/6 rounded"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="animate-pulse bg-gray-300 h-8 w-8 rounded-lg mx-auto"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-300 h-9 w-16 rounded-lg"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        /* style={{ 
          background: 'linear-gradient(135deg, #FFE5D9 0%, #FFF5F0 25%, #FFFFFF 50%, #F0F8FF 75%, #E0F4FF 100%)'
        }} */
      >
        <div className="bg-red-50 rounded-lg p-6 max-w-md">
          <p className="text-red-900 font-semibold">Erreur</p>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      /* style={{ 
        background: 'linear-gradient(135deg, #FFE5D9 0%, #FFF5F0 25%, #FFFFFF 50%, #F0F8FF 75%, #E0F4FF 100%)'
      }} */
    >
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
          </div>
        </div>
      </div>

      <div className="tableau max-w-7xl mx-auto px-8 py-8">
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none"
              >
                <option value="all">Toutes les dates</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette annÃ©e</option>
              </select>
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none"
              >
                <option value="all">Toutes les catÃ©gories</option>
                {Object.entries(categories).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none"
              >
                <option value="all">Tous les tags</option>
                {Object.entries(tags).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none"
              >
                <option value="all">Tous les pays</option>
                {Object.entries(countries).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtres actifs:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm">
                  {`Recherche: "${searchTerm}"`}
                  <button onClick={() => setSearchTerm('')} className="hover:text-gray-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm">
                  {categories[categoryFilter]}
                  <button onClick={() => setCategoryFilter('all')} className="hover:text-gray-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {tagFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm">
                  {tags[tagFilter]}
                  <button onClick={() => setTagFilter('all')} className="hover:text-gray-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {countryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm">
                  {countries[countryFilter]}
                  <button onClick={() => setCountryFilter('all')} className="hover:text-gray-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button 
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline ml-2"
              >
                Tout effacer
              </button>
            </div>
          )}
        </div>

        <div className="bg-white overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  CatÃ©gories & Pays
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Extrait
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Lien
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {paginatedPosts.map((post, index) => (
                <tr key={post.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {stripHtml(post.title.rendered)}
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map(tagId => (
                          tags[tagId] && (
                            <button
                              key={tagId}
                              onClick={() => handleTagClick(tagId)}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              {tags[tagId]}
                            </button>
                          )
                        ))}
                        {post.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.categories && post.categories.map(catId => (
                        categories[catId] && (
                          <button
                            key={catId}
                            onClick={() => handleCategoryClick(catId)}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-900 text-white hover:bg-gray-700 transition-colors cursor-pointer"
                          >
                            {categories[catId]}
                          </button>
                        )
                      ))}
                    </div>
                    {post.country && post.country.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.country.map(countryId => (
                          countries[countryId] && (
                            <button
                              key={countryId}
                              onClick={() => handleCountryClick(countryId)}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
                            >
                              {countries[countryId]}
                            </button>
                          )
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {formatDate(post.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {stripHtml(post?.excerpt?.rendered || '')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => copyToClipboard(post.link, post.id)}
                      className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copier le lien"
                    >
                      {copiedId === post.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Lire
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-gray-50">
              <p className="text-gray-500">Aucun article ne correspond à vos critères de recherche.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-gray-50 px-6 py-4 rounded-lg">
            <div className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages} ({filteredPosts.length} articles)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                PrÃ©cÃ©dent
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-2 py-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}