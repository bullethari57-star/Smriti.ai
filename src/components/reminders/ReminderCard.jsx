import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  Edit3, 
  Trash2, 
  Link as LinkIcon, 
  AlertTriangle 
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { formatShortDate, formatTime12h, getRelativeDays } from '../../services/dateUtils';
import { useApp } from '../../context/AppContext';

export function ReminderCard({ reminder, onEdit, onDelete }) {
  const { toggleReminder, memories } = useApp();

  const isCompleted = reminder.status === 'completed';
  const isOverdue = reminder.status === 'overdue';

  // Check if linked to a memory
  const linkedMemory = reminder.linkedMemoryId 
    ? memories.find(m => m.id === reminder.linkedMemoryId)
    : null;

  const relativeText = getRelativeDays(reminder.date);

  return (
    <div
      className={`rounded-2xl border p-5 transition-all shadow-soft hover:shadow-soft-lg flex flex-col justify-between group ${
        isCompleted
          ? 'bg-slate-50/80 border-slate-200 opacity-75'
          : isOverdue
          ? 'bg-rose-50/40 border-rose-200'
          : 'bg-white border-slate-100'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Complete Checkbox Toggle */}
            <button
              onClick={() => toggleReminder(reminder.id)}
              aria-label={isCompleted ? `Mark ${reminder.title} as incomplete` : `Mark ${reminder.title} as completed`}
              className="flex-shrink-0 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <Circle className="w-5 h-5 hover:text-slate-600" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <h3
                className={`text-base font-bold text-navy-900 leading-snug break-words ${
                  isCompleted ? 'line-through text-slate-400' : ''
                }`}
              >
                {reminder.title}
              </h3>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(reminder)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
              aria-label={`Edit ${reminder.title}`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(reminder)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              aria-label={`Delete ${reminder.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {reminder.description && (
          <p className={`text-sm mb-3 pl-8 leading-relaxed ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
            {reminder.description}
          </p>
        )}

        {/* Linked memory badge if any */}
        {linkedMemory && (
          <div className="ml-8 mb-3 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs border border-violet-100">
            <LinkIcon className="w-3 h-3 text-violet-500" />
            <span className="truncate max-w-xs">Linked: {linkedMemory.title}</span>
          </div>
        )}
      </div>

      {/* Footer metadata */}
      <div className="mt-3 pt-3 border-t border-slate-100 pl-8 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1 font-medium">
            <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`} />
            <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
              {formatShortDate(reminder.date)}
              {relativeText && ` (${relativeText})`}
            </span>
          </div>

          {reminder.time && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTime12h(reminder.time)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <PriorityBadge priority={reminder.priority} />
          <StatusBadge status={reminder.status} />
        </div>
      </div>
    </div>
  );
}
