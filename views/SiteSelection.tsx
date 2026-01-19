
import React from 'react';
import { Site } from '../types';
import { MapPin, ArrowRight, Construction } from 'lucide-react';

interface SiteSelectionProps {
  sites: Site[];
  onSelect: (site: Site) => void;
}

const SiteSelection: React.FC<SiteSelectionProps> = ({ sites, onSelect }) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black text-slate-900 mb-6 px-1">투입 현장 선택</h2>
      <div className="grid gap-4">
        {sites.map(site => (
          <button
            key={site.id}
            onClick={() => onSelect(site)}
            className="flex items-center text-left p-5 bg-white rounded-3xl shadow-sm border border-slate-200 hover:border-blue-600 hover:shadow-lg transition-all group"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 mr-4 group-hover:bg-blue-700 group-hover:text-white transition-colors">
              <Construction size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-slate-900 text-lg line-clamp-1">{site.name}</h3>
              <p className="text-sm text-slate-500 font-medium flex items-center mt-1">
                <MapPin size={14} className="mr-1 text-slate-400" />
                {site.address}
              </p>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-700 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SiteSelection;
