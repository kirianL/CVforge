import React from 'react';
import { useCVStore } from '../../lib/store';

export const AtsAnalyzer: React.FC = () => {
  const { content } = useCVStore();
  const { personal, summary, experience, education, skills, projects, certifications, languages } = content;

  // Calcular la puntuación y las recomendaciones
  const analyzeCV = () => {
    let score = 0;
    const recommendations: { text: string; completed: boolean; points: number }[] = [];

    // 1. Información Personal (Total: 40%)
    if (personal.name?.trim()) {
      score += 10;
      recommendations.push({ text: 'Nombre completo especificado', completed: true, points: 10 });
    } else {
      recommendations.push({ text: 'Añade tu nombre completo', completed: false, points: 10 });
    }

    if (personal.title?.trim()) {
      score += 10;
      recommendations.push({ text: 'Título profesional o cargo definido', completed: true, points: 10 });
    } else {
      recommendations.push({ text: 'Añade tu profesión o título profesional objetivo', completed: false, points: 10 });
    }

    if (personal.email?.trim()) {
      score += 10;
      recommendations.push({ text: 'Correo electrónico de contacto proporcionado', completed: true, points: 10 });
    } else {
      recommendations.push({ text: 'Proporciona un correo electrónico de contacto', completed: false, points: 10 });
    }

    if (personal.phone?.trim()) {
      score += 10;
      recommendations.push({ text: 'Número de teléfono de contacto proporcionado', completed: true, points: 10 });
    } else {
      recommendations.push({ text: 'Añade un número de teléfono de contacto', completed: false, points: 10 });
    }

    // Ubicación (Ubicación da peso en búsquedas geográficas de ATS)
    if (personal.location?.trim()) {
      score += 5;
      recommendations.push({ text: 'Ubicación (Ciudad, País) especificada', completed: true, points: 5 });
    } else {
      recommendations.push({ text: 'Añade tu ubicación (Ciudad, País) para búsquedas geográficas', completed: false, points: 5 });
    }

    // 2. Resumen Profesional (Total: 15%)
    const summaryLength = summary?.trim().length || 0;
    if (summaryLength >= 100) {
      score += 15;
      recommendations.push({ text: 'Resumen profesional completo y bien desarrollado (mín. 100 caracteres)', completed: true, points: 15 });
    } else if (summaryLength > 0) {
      score += 5;
      recommendations.push({ text: 'Tu resumen es corto. Alárgalo un poco (mínimo recomendado: 100 caracteres)', completed: false, points: 10 });
    } else {
      recommendations.push({ text: 'Escribe un resumen profesional destacando tus fortalezas', completed: false, points: 15 });
    }

    // 3. Experiencia Laboral (Total: 20%)
    if (experience.length > 0) {
      score += 10;
      
      // Validar si las experiencias tienen descripciones detalladas de logros
      const hasDetailedDesc = experience.every(exp => exp.description?.trim().length >= 50);
      if (hasDetailedDesc) {
        score += 10;
        recommendations.push({ text: 'Experiencias laborales documentadas con descripción de logros (mín. 50 caracteres)', completed: true, points: 10 });
      } else {
        recommendations.push({ text: 'Describe con más detalle tus logros en cada experiencia (al menos 50 caracteres por puesto)', completed: false, points: 10 });
      }
    } else {
      recommendations.push({ text: 'Añade al menos una experiencia laboral relevante', completed: false, points: 20 });
    }

    // 4. Habilidades (Total: 15%)
    if (skills.length >= 5) {
      score += 15;
      recommendations.push({ text: 'Múltiples palabras clave y habilidades agregadas (mín. 5)', completed: true, points: 15 });
    } else if (skills.length >= 2) {
      score += 5;
      recommendations.push({ text: 'Añade más habilidades técnicas/blandas para enriquecer palabras clave (mín. 5)', completed: false, points: 10 });
    } else {
      recommendations.push({ text: 'Agrega tus habilidades clave (son esenciales para coincidir con las ofertas ATS)', completed: false, points: 15 });
    }

    // 5. Idiomas y Certificaciones / Proyectos (Total: 10%)
    if (languages.length > 0) {
      score += 5;
      recommendations.push({ text: 'Idiomas dominados especificados', completed: true, points: 5 });
    } else {
      recommendations.push({ text: 'Menciona los idiomas que hablas', completed: false, points: 5 });
    }

    if (certifications.length > 0 || projects.length > 0) {
      score += 5;
      recommendations.push({ text: 'Sección adicional (Proyectos o Certificaciones) agregada', completed: true, points: 5 });
    } else {
      recommendations.push({ text: 'Añade algún proyecto o certificación para robustecer tu perfil', completed: false, points: 5 });
    }

    // Normalizar score máximo a 100
    const finalScore = Math.min(score, 100);

    return { score: finalScore, recommendations };
  };

  const { score, recommendations } = analyzeCV();

  // Color según el puntaje
  let strokeColor = 'stroke-red-500';
  let textColor = 'text-red-650 dark:text-red-400';
  let bgColor = 'bg-red-50 dark:bg-red-950/20';
  let label = 'Crítico';

  if (score >= 80) {
    strokeColor = 'stroke-emerald-500';
    textColor = 'text-emerald-700 dark:text-emerald-400';
    bgColor = 'bg-emerald-50 dark:bg-emerald-950/20';
    label = 'Excelente';
  } else if (score >= 50) {
    strokeColor = 'stroke-amber-500';
    textColor = 'text-amber-700 dark:text-amber-400';
    bgColor = 'bg-amber-50 dark:bg-amber-950/20';
    label = 'Mejorable';
  }

  // Configuración del círculoSVG
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const pendingRecs = recommendations.filter(r => !r.completed);
  const completedRecs = recommendations.filter(r => r.completed);

  return (
    <div className="p-4 border border-zinc-200 rounded-xl bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm space-y-4">
      <div className="flex items-center gap-4">
        {/* SVG Progress Circle */}
        <div className="relative flex items-center justify-center shrink-0 w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-zinc-100 dark:stroke-zinc-850"
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
      <div className="space-y-2 border-t border-zinc-150 pt-3 dark:border-zinc-850">
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Tareas Pendientes ({pendingRecs.length})</h5>
        
        {pendingRecs.length === 0 ? (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 text-emerald-800 border border-emerald-100 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/30 text-xs font-semibold">
            <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>¡Enhorabuena! Has optimizado todos los puntos críticos.</span>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {pendingRecs.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-zinc-650 dark:text-zinc-400">
                <span className="text-amber-500 shrink-0 mt-0.5" title="Sugerencia de optimización">⚠</span>
                <span className="leading-snug">{rec.text} <span className="text-[10px] text-zinc-400 font-semibold">(+{rec.points}%)</span></span>
              </div>
            ))}
          </div>
        )}

        {completedRecs.length > 0 && (
          <details className="group mt-2 border-t border-zinc-100 dark:border-zinc-850/50 pt-2 cursor-pointer">
            <summary className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-500 transition-colors flex items-center justify-between list-none">
              <span>PUNTOS COMPLETADOS ({completedRecs.length})</span>
              <svg className="h-3 w-3 transform group-open:rotate-180 transition-transform text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-2 space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
              {completedRecs.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-zinc-450 dark:text-zinc-550 line-through">
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
