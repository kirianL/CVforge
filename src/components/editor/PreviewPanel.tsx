import React from 'react';
import { useCVStore } from '../../lib/store';

export const PreviewPanel: React.FC = () => {
  const { content } = useCVStore();
  const { personal, summary, experience, education, skills, projects, certifications, languages, sectionOrder } = content;

  // Renderizador dinámico de secciones según el orden definido
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'personal':
        return (
          <div key="personal" class="text-center mb-6">
            <h1 class="text-3xl font-bold tracking-tight text-zinc-900 uppercase">{personal.name || 'Tu Nombre'}</h1>
            <p class="text-lg font-medium text-zinc-650 mt-1">{personal.title || 'Tu Profesión'}</p>
            <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-500">
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>• {personal.phone}</span>}
              {personal.website && <span>• {personal.website}</span>}
              {personal.location && <span>• {personal.location}</span>}
            </div>
          </div>
        );

      case 'summary':
        if (!summary) return null;
        return (
          <div key="summary" class="mb-5">
            <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Perfil Profesional</h2>
            <p class="text-[10.5pt] leading-relaxed text-zinc-750 text-justify whitespace-pre-line">{summary}</p>
          </div>
        );

      case 'experience':
        if (experience.length === 0) return null;
        return (
          <div key="experience" class="mb-5">
            <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Experiencia Laboral</h2>
            <div class="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} class="text-[10.5pt]">
                  <div class="flex justify-between items-baseline font-semibold text-zinc-800">
                    <span>{exp.role} | {exp.company}</span>
                    <span class="text-xs text-zinc-500 font-normal">
                      {exp.startDate} – {exp.current ? 'Presente' : exp.endDate || 'Presente'}
                    </span>
                  </div>
                  {exp.description && (
                    <p class="mt-1 text-zinc-750 text-justify leading-relaxed whitespace-pre-line pl-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (education.length === 0) return null;
        return (
          <div key="education" class="mb-5">
            <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Educación</h2>
            <div class="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} class="text-[10.5pt]">
                  <div class="flex justify-between items-baseline font-semibold text-zinc-800">
                    <span>{edu.degree} en {edu.field}</span>
                    <span class="text-xs text-zinc-500 font-normal">
                      {edu.startDate} – {edu.current ? 'Presente' : edu.endDate}
                    </span>
                  </div>
                  <div class="text-zinc-650 text-xs">{edu.school}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (skills.length === 0) return null;
        return (
          <div key="skills" class="mb-5">
            <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Habilidades</h2>
            <div class="text-[10.5pt] leading-relaxed text-zinc-750">
              {skills.join(', ')}
            </div>
          </div>
        );

      case 'projects':
        if (projects.length === 0) return null;
        return (
          <div key="projects" class="mb-5">
            <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Proyectos</h2>
            <div class="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} class="text-[10.5pt]">
                  <div class="flex justify-between items-baseline font-semibold text-zinc-800">
                    <span>
                      {proj.name} {proj.role && <span class="text-zinc-650 font-normal">({proj.role})</span>}
                    </span>
                    {proj.link && (
                      <span class="text-xs text-zinc-500 font-normal underline">{proj.link}</span>
                    )}
                  </div>
                  {proj.description && (
                    <p class="mt-1 text-zinc-750 leading-relaxed text-justify">{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (certifications.length === 0) return null;
        return (
          <div key="certifications" class="mb-5">
            <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Certificaciones</h2>
            <div class="space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} class="text-[10.5pt] flex justify-between items-baseline">
                  <span>
                    <span class="font-semibold">{cert.name}</span> – <span class="text-zinc-650 text-xs">{cert.issuer}</span>
                  </span>
                  <span class="text-xs text-zinc-500">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (languages.length === 0) return null;
        return (
          <div key="languages" class="mb-5">
            <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Idiomas</h2>
            <div class="text-[10.5pt] leading-relaxed text-zinc-750">
              {languages.map((l) => `${l.name} (${l.proficiency})`).join(', ')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-150 p-6 flex justify-center items-start print:bg-white print:p-0">
      {/* Hoja A4 del Currículum */}
      <div 
        id="cv-print-area"
        className="w-[21cm] min-h-[29.7cm] bg-white text-zinc-900 shadow-md border border-zinc-200/50 p-[2cm] print:shadow-none print:border-none print:p-0 print:w-full print:min-h-0"
      >
        {sectionOrder.map((sectionId) => renderSection(sectionId))}
      </div>
    </div>
  );
};
