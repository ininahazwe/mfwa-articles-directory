'use client';

import TableRow from './TableRow';

export default function ArticlesTable({ 
  posts, 
  categories, 
  tags, 
  copiedId, 
  onCategoryClick, 
  onTagClick, 
  onCopyLink, 
  formatDate, 
  stripHtml 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">Article</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">Categories</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">Excerpt</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Share</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <TableRow
                  key={post.id}
                  post={post}
                  index={index}
                  categories={categories}
                  tags={tags}
                  copiedId={copiedId}
                  onCategoryClick={onCategoryClick}
                  onTagClick={onTagClick}
                  onCopyLink={onCopyLink}
                  formatDate={formatDate}
                  stripHtml={stripHtml}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No articles found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}