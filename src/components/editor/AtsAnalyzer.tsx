import React from 'react';
import { useCVStore } from '../../lib/store';
import { analyzeCV } from '../../lib/ats';

export const AtsAnalyzer: React.FC = () => {
  const { content } = useCVStore();
  const { score, recommendations, label, strokeColor, textColor, bgColor } = analyzeCV(content);

  // Configuración del círculo SVG
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const pendingRecs = recommendations.filter(r => !r.completed);
  const completedRecs = recommendations.filter(r => r.completed);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* SVG Progress Circle */}
        <div className="relative flex items-center justify-center shrink-0 w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-zinc-100 dark:stroke-zinc-800"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className={`${strokeColor} transition-all duration-500 ease-out`}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          {/* Centered Percentage */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-base font-extrabold tracking-tight">{score}%</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">ATS</span>
          </div>
        </div>

        {/* Text information */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Optimización ATS</h4>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bgColor} ${textColor}`}>
              {label}
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-normal">
            {score >= 80 
              ? '¡Tu currículum cumple con las mejores prácticas y tiene altas probabilidades de pasar filtros automatizados!' 
              : score >= 50
              ? 'Tu currículum está bien encaminado, pero aún puedes optimizar palabras clave y completar campos esenciales.'
              : 'Completa la información básica y añade experiencia laboral para que el analizador pueda calificar tu CV.'}
          </p>
        </div>
      </div>

      {/* Sugerencias Checklist */}
      <div className="space-y-2 border-t border-zinc-150 pt-3 dark:border-zinc-800/40">
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Tareas Pendientes ({pendingRecs.length})</h5>
        
        {pendingRecs.length === 0 ? (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/30 text-xs font-semibold">
            <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>¡Excelente! Has optimizado todos los puntos críticos para los filtros ATS.</span>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
            {pendingRecs.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="text-amber-500 shrink-0 mt-0.5" title="Sugerencia de optimización">⚠</span>
                <span className="leading-snug">{rec.text} <span className="text-[10px] text-zinc-400 font-semibold">(+{rec.points}%)</span></span>
              </div>
            ))}
          </div>
        )}

        {completedRecs.length > 0 && (
          <details className="group mt-2 border-t border-zinc-100 dark:border-zinc-800/20 pt-2 cursor-pointer">
            <summary className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 hover:text-zinc-550 transition-colors flex items-center justify-between list-none">
              <span>PUNTOS COMPLETADOS ({completedRecs.length})</span>
              <svg className="h-3 w-3 transform group-open:rotate-180 transition-transform text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-2 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {completedRecs.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-650 line-through">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span className="leading-snug">{rec.text}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};
