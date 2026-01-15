'use client';

import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input 
        type="text" 
        placeholder="Search..." 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" 
      />
    </div>
  );
}