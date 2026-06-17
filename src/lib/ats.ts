import type { CVContent } from './store';

export interface AtsRecommendation {
  text: string;
  completed: boolean;
  points: number;
}

export interface AtsAnalysisResult {
  score: number;
  recommendations: AtsRecommendation[];
  label: string;
  strokeColor: string;
  textColor: string;
  bgColor: string;
}

export function analyzeCV(content: CVContent): AtsAnalysisResult {
  const { personal, summary, experience, skills, projects, certifications, languages } = content;
  let score = 0;
  const recommendations: AtsRecommendation[] = [];

  // 1. Información Personal (Total: 40%)
  if (personal?.name?.trim()) {
    score += 10;
    recommendations.push({ text: 'Nombre completo especificado', completed: true, points: 10 });
  } else {
    recommendations.push({ text: 'Añade tu nombre completo', completed: false, points: 10 });
  }

  if (personal?.title?.trim()) {
    score += 10;
    recommendations.push({ text: 'Título profesional o cargo definido', completed: true, points: 10 });
  } else {
    recommendations.push({ text: 'Añade tu profesión o título profesional objetivo', completed: false, points: 10 });
  }

  if (personal?.email?.trim()) {
    score += 10;
    recommendations.push({ text: 'Correo electrónico de contacto proporcionado', completed: true, points: 10 });
  } else {
    recommendations.push({ text: 'Proporciona un correo electrónico de contacto', completed: false, points: 10 });
  }

  if (personal?.phone?.trim()) {
    score += 10;
    recommendations.push({ text: 'Número de teléfono de contacto proporcionado', completed: true, points: 10 });
  } else {
    recommendations.push({ text: 'Añade un número de teléfono de contacto', completed: false, points: 10 });
  }

  // Ubicación (Ubicación da peso en búsquedas geográficas de ATS)
  if (personal?.location?.trim()) {
    score += 5;
    recommendations.push({ text: 'Ubicación (Ciudad, País) especificada', completed: true, points: 5 });
  } else {
    recommendations.push({ text: 'Añade tu ubicación (Ciudad, País) para búsquedas geográficas', completed: false, points: 5 });
  }

  // 2. Resumen Profesional (Total: 15%)
  const summaryLength = (summary || '').trim().length;
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
  if (experience && experience.length > 0) {
    score += 10;
    
    // Validar si las experiencias tienen descripciones detalladas de logros
    const hasDetailedDesc = experience.every(exp => (exp.description || '').trim().length >= 50);
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
  if (skills && skills.length >= 5) {
    score += 15;
    recommendations.push({ text: 'Múltiples palabras clave y habilidades agregadas (mín. 5)', completed: true, points: 15 });
  } else if (skills && skills.length >= 2) {
    score += 5;
    recommendations.push({ text: 'Añade más habilidades técnicas/blandas para enriquecer palabras clave (mín. 5)', completed: false, points: 10 });
  } else {
    recommendations.push({ text: 'Agrega tus habilidades clave (son esenciales para coincidir con las ofertas ATS)', completed: false, points: 15 });
  }

  // 5. Idiomas y Certificaciones / Proyectos (Total: 10%)
  if (languages && languages.length > 0) {
    score += 5;
    recommendations.push({ text: 'Idiomas dominados especificados', completed: true, points: 5 });
  } else {
    recommendations.push({ text: 'Menciona los idiomas que hablas', completed: false, points: 5 });
  }

  if ((certifications && certifications.length > 0) || (projects && projects.length > 0)) {
    score += 5;
    recommendations.push({ text: 'Sección adicional (Proyectos o Certificaciones) agregada', completed: true, points: 5 });
  } else {
    recommendations.push({ text: 'Añade algún proyecto o certificación para robustecer tu perfil', completed: false, points: 5 });
  }

  const finalScore = Math.min(score, 100);

  // Mapeos de color
  let strokeColor = 'stroke-red-500';
  let textColor = 'text-red-650 dark:text-red-400';
  let bgColor = 'bg-red-50 dark:bg-red-950/20';
  let label = 'Crítico';

  if (finalScore >= 80) {
    strokeColor = 'stroke-emerald-500';
    textColor = 'text-emerald-700 dark:text-emerald-400';
    bgColor = 'bg-emerald-50 dark:bg-emerald-950/20';
    label = 'Excelente';
  } else if (finalScore >= 50) {
    strokeColor = 'stroke-amber-500';
    textColor = 'text-amber-700 dark:text-amber-400';
    bgColor = 'bg-amber-50 dark:bg-amber-950/20';
    label = 'Mejorable';
  }

  return {
    score: finalScore,
    recommendations,
    label,
    strokeColor,
    textColor,
    bgColor
  };
}
