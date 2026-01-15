'use client';

import { Calendar } from 'lucide-react';

const DATE_PRESETS = [
  { value: 'all', label: 'All' },
  { value: 'week', label: '7 days' },
  { value: 'month', label: '30 days' },
  { value: '3months', label: '3 months' },
  { value: '6months', label: '6 months' },
  { value: 'year', label: '1 year' }
];

export default function DateFilters({ 
  datePreset, 
  startDate, 
  endDate, 
  onPresetChange, 
  onStartDateChange, 
  onEndDateChange 
}) {
  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">Period:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map((preset) => (
            <button 
              key={preset.value} 
              onClick={() => onPresetChange(preset.value)} 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                datePreset === preset.value 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        
        <div className="hidden lg:block w-px h-8 bg-gray-300 mx-2"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">or</span>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => onStartDateChange(e.target.value)} 
            className="px-3 py-1.5 text-sm bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" 
          />
          <span className="text-gray-400">→</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => onEndDateChange(e.target.value)} 
            className="px-3 py-1.5 text-sm bg-white rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" 
          />
        </div>
      </div>
    </div>
  );
}