'use client';

export default function SelectFilters({ 
  categories, 
  tags, 
  categoryFilter, 
  tagFilter, 
  onCategoryChange, 
  onTagChange 
}) {
  return (
    <>
      <select 
        value={categoryFilter} 
        onChange={(e) => onCategoryChange(e.target.value)} 
        className="w-full px-4 py-2 bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none"
      >
        <option value="all">All categories</option>
        {Object.entries(categories).map(([id, name]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>
      
      <select 
        value={tagFilter} 
        onChange={(e) => onTagChange(e.target.value)} 
        className="w-full px-4 py-2 bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none"
      >
        <option value="all">All tags</option>
        {Object.entries(tags).map(([id, name]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>
    </>
  );
}