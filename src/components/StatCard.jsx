import React from 'react';

function StatCard({ title, value, icon: Icon, color, description, delay = 0 }) {
  const colorClasses = {
    teal: 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal',
    navy: 'bg-brand-navy/10 border-brand-navy/20 text-brand-navy',
    gold: 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold',
    engage: 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal',
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-soft border border-gray-100 p-6 animate-slide-up font-thin"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg border ${colorClasses[color] || colorClasses.teal}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-light text-gray-600">{title}</p>
          <p className="text-2xl font-light text-brand-navy">{value.toLocaleString()}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500 font-extralight">{description}</p>
    </div>
  );
}

export default StatCard;