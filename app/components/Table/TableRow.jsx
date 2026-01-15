'use client';

import { Copy, Check } from 'lucide-react';

export default function TableRow({ 
  post, 
  index, 
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
    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 mb-2">
          {stripHtml(post.title.rendered)}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map(tagId => tags[tagId] && (
              <button 
                key={tagId} 
                onClick={() => onTagClick(tagId)} 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {tags[tagId]}
              </button>
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
          {post.categories && post.categories.map(catId => categories[catId] && (
            <button 
              key={catId} 
              onClick={() => onCategoryClick(catId)} 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-900 text-white hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {categories[catId]}
            </button>
          ))}
        </div>
        {/* Le bloc "country" a été supprimé ici */}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">{formatDate(post.date)}</div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600 line-clamp-2">
          {stripHtml(post?.excerpt?.rendered || '')}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <button 
          onClick={() => onCopyLink(post.link, post.id)} 
          className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" 
          title="Copy link"
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
          Read
        </a>
      </td>
    </tr>
  );
}