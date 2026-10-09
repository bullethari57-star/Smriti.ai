import React from 'react';

export function CategoryBadge({ category }) {
  const styles = {
    Birthday: 'bg-rose-50 text-rose-700 border-rose-200',
    People: 'bg-violet-50 text-violet-700 border-violet-200',
    'Personal Goal': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Important Event': 'bg-amber-50 text-amber-700 border-amber-200',
    Preference: 'bg-sky-50 text-sky-700 border-sky-200',
    Academic: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Project: 'bg-purple-50 text-purple-700 border-purple-200',
    Personal: 'bg-teal-50 text-teal-700 border-teal-200',
    Other: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const currentStyle = styles[category] || styles.Other;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}>
      {category || 'General'}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const styles = {
    High: 'bg-red-50 text-red-700 border-red-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const currentStyle = styles[priority] || styles.Medium;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${currentStyle}`}>
      {priority} Priority
    </span>
  );
}

export function StatusBadge({ status }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        Completed
      </span>
    );
  }
  if (status === 'overdue') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 animate-pulse">
        Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
      Upcoming
    </span>
  );
}
