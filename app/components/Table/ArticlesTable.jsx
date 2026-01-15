'use client';

import TableRow from './TableRow';

export default function ArticlesTable({ 
  posts, 
  categories, 
  tags, 
  countries, 
  copiedId, 
  onCategoryClick, 
  onTagClick, 
  onCountryClick, 
  onCopyLink, 
  formatDate, 
  stripHtml 
}) {
  return (
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
          {posts.map((post, index) => (
            <TableRow
              key={post.id}
              post={post}
              index={index}
              categories={categories}
              tags={tags}
              countries={countries}
              copiedId={copiedId}
              onCategoryClick={onCategoryClick}
              onTagClick={onTagClick}
              onCountryClick={onCountryClick}
              onCopyLink={onCopyLink}
              formatDate={formatDate}
              stripHtml={stripHtml}
            />
          ))}
        </tbody>
      </table>
      
      {posts.length === 0 && (
        <div className="text-center py-12 bg-gray-50">
          <p className="text-gray-500">No articles match your search criteria.</p>
        </div>
      )}
    </div>
  );
}