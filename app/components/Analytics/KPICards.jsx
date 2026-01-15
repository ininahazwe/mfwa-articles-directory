'use client';

import { TrendingUp, FileText } from 'lucide-react';

export default function KPICards({ analyticsData }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
          <FileText className="w-4 h-4" />
          Top Category
        </div>
        <div className="text-lg font-bold text-purple-600 truncate" title={analyticsData.topCategory}>
          {analyticsData.topCategory}
        </div>
        <div className="text-xs text-gray-400">{analyticsData.topCategoryCount} articles</div>
      </div>
    </div>
  );
}