'use client';

import { X, Calendar } from 'lucide-react';

export default function ActiveFilters({ 
  searchTerm, 
  dateFilterLabel, 
  categoryFilter, 
  tagFilter, 
  categories, 
  tags, 
  onClearSearch, 
  onClearDate, 
  onClearCategory, 
  onClearTag, 
  onClearAll 
}) {
  // Mise à jour de la condition de présence de filtres actifs
  const hasActiveFilters = searchTerm || dateFilterLabel || categoryFilter !== 'all' || tagFilter !== 'all';

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
      <span className="text-sm text-gray-600">Active filters:</span>
      
      {searchTerm && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm">
          Search: &ldquo;{searchTerm}&rdquo;
          <button onClick={onClearSearch} className="hover:text-gray-900">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      
      {dateFilterLabel && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
          <Calendar className="w-3 h-3" />
          {dateFilterLabel}
          <button onClick={onClearDate} className="hover:text-orange-900">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      
      {categoryFilter !== 'all' && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm">
          {categories[categoryFilter]}
          <button onClick={onClearCategory} className="hover:text-gray-900">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      
      {tagFilter !== 'all' && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm">
          {tags[tagFilter]}
          <button onClick={onClearTag} className="hover:text-gray-900">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      
      <button onClick={onClearAll} className="text-sm text-gray-600 hover:text-gray-900 underline ml-2">
        Clear all
      </button>
    </div>
  );
}