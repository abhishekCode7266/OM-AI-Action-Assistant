'use client';

import React, { useState } from 'react';
import { ActionStep } from '@/types';
import { CheckCircle2, ChevronDown, ChevronUp, Loader2, PlayCircle, Sparkles } from 'lucide-react';

interface ActionStepsTrackerProps {
  steps: ActionStep[];
}

export const ActionStepsTracker: React.FC<ActionStepsTrackerProps> = ({ steps }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!steps || steps.length === 0) return null;

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const isAllComplete = completedCount === steps.length;
  const inProgressStep = steps.find((s) => s.status === 'in_progress');

  return (
    <div className="mb-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 shadow-lg backdrop-blur-md transition-all">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Action Pipeline
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {completedCount}/{steps.length}
              </span>
            </div>
            {inProgressStep && !isAllComplete && (
              <p className="text-xs text-blue-400 font-medium animate-pulse mt-0.5">
                {inProgressStep.title}
              </p>
            )}
          </div>
        </div>

        <button className="text-slate-400 hover:text-white p-1">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';

            return (
              <div
                key={step.id || idx}
                className="flex items-start gap-2.5 text-xs text-slate-300"
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isInProgress ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : (
                    <PlayCircle className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      isCompleted
                        ? 'text-slate-400 line-through'
                        : isInProgress
                        ? 'text-blue-300 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-[11px] text-slate-400 mt-0.5">{step.description}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
