import React from 'react';
import { useCVStore } from '../../lib/store';

interface PreviewPanelProps {
  className?: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ className = '' }) => {
  const { content } = useCVStore();
  const { personal, summary, experience, education, skills, projects, certifications, languages, sectionOrder } = content;

  // Estados para el auto-escalado y el control de zoom
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(800);
  const [zoom, setZoom] = React.useState<number | 'fit'>('fit');

  // Registrar observador de tamaño para el contenedor principal
  React.useLayoutEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Ancho y alto de referencia del documento A4 (basado en 96 DPI estándar)
  const refWidth = 794;
  const refHeight = 1123;

  // Calcular el factor de escala dinámico
  const scale = zoom === 'fit' 
    ? Math.min(1.0, Math.max(0.3, (containerWidth - 48) / refWidth))
    : zoom;

  // Renderizador dinámico de secciones según el orden definido
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'personal':
        return (
          <div key="personal" className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 uppercase">{personal.name || 'Tu Nombre'}</h1>
            <p className="text-lg font-medium text-zinc-650 mt-1">{personal.title || 'Tu Profesión'}</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-550">
              {personal.email && (
                <span>
                  <a 
                    href={`mailto:${personal.email}`} 
                    className="hover:underline text-zinc-650"
                  >
                    {personal.email}
                  </a>
                </span>
              )}
              {personal.phone && <span>• {personal.phone}</span>}
              {personal.website && (
                <span>
                  •{' '}
                  <a 
                    href={personal.website.startsWith('http') ? personal.website : `https://${personal.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline text-zinc-650 font-medium"
                  >
                    {personal.website}
                  </a>
                </span>
              )}
              {personal.location && <span>• {personal.location}</span>}
            </div>
          </div>
        );

      case 'summary':
        if (!summary) return null;
        return (
          <div key="summary" className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Perfil Profesional</h2>
            <p className="text-[10.5pt] leading-relaxed text-zinc-750 text-justify whitespace-pre-line">{summary}</p>
          </div>
        );

      case 'experience':
        if (experience.length === 0) return null;
        return (
          <div key="experience" className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Experiencia Laboral</h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="text-[10.5pt]">
                  <div className="flex justify-between items-baseline font-semibold text-zinc-850">
                    <span>{exp.role} | {exp.company}</span>
                    <span className="text-xs text-zinc-500 font-normal">
                      {exp.startDate} – {exp.current ? 'Presente' : exp.endDate || 'Presente'}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="mt-1 text-zinc-750 text-justify leading-relaxed whitespace-pre-line pl-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (education.length === 0) return null;
        return (
          <div key="education" className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Educación</h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="text-[10.5pt]">
                  <div className="flex justify-between items-baseline font-semibold text-zinc-850">
                    <span>{edu.degree} en {edu.field}</span>
                    <span className="text-xs text-zinc-500 font-normal">
                      {edu.startDate} – {edu.current ? 'Presente' : edu.endDate}
                    </span>
                  </div>
                  <div className="text-zinc-650 text-xs">{edu.school}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (skills.length === 0) return null;
        return (
          <div key="skills" className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Habilidades</h2>
            <div className="text-[10.5pt] leading-relaxed text-zinc-750">
              {skills.join(', ')}
            </div>
          </div>
        );

      case 'projects':
        if (projects.length === 0) return null;
        return (
          <div key="projects" className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Proyectos</h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="text-[10.5pt]">
                  <div className="flex justify-between items-baseline font-semibold text-zinc-850">
                    <span>
                      {proj.name} {proj.role && <span className="text-zinc-650 font-normal">({proj.role})</span>}
                    </span>
                    {proj.link && (
                      <a 
                        href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-zinc-550 font-normal underline hover:text-zinc-850 transition-colors"
                      >
                        {proj.link}
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="mt-1 text-zinc-750 leading-relaxed text-justify">{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (certifications.length === 0) return null;
        return (
          <div key="certifications" className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Certificaciones</h2>
            <div className="space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="text-[10.5pt] flex justify-between items-baseline">
                  <span>
                    <span className="font-semibold">{cert.name}</span> – <span className="text-zinc-650 text-xs">{cert.issuer}</span>
                  </span>
                  <span className="text-xs text-zinc-500">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (languages.length === 0) return null;
        return (
          <div key="languages" className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-1 mb-2">Idiomas</h2>
            <div className="text-[10.5pt] leading-relaxed text-zinc-750">
              {languages.map((l) => `${l.name} (${l.proficiency})`).join(', ')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-auto bg-zinc-150 p-6 flex justify-center items-start print:bg-white print:p-0 relative ${className}`}
    >
      {/* Scaled Wrapper Box to preserve document flow dimensions */}
      <div 
        id="cv-print-wrapper"
        className="relative flex justify-center items-start overflow-hidden select-none print:w-full print:h-auto print:min-h-0 print:overflow-visible print:relative shadow-sm border border-zinc-200/40 rounded-sm bg-zinc-200/10"
        style={{
          width: `${refWidth * scale}px`,
          height: `${refHeight * scale}px`,
          minHeight: `${refHeight * scale}px`,
          transition: 'width 0.15s ease-out, height 0.15s ease-out'
        }}
      >
        <div 
          id="cv-print-area"
          className="w-[21cm] min-h-[29.7cm] bg-white text-zinc-900 shadow-md p-[2cm] print:shadow-none print:border-none print:p-0 print:w-full print:min-h-0 absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
        >
          {sectionOrder.map((sectionId) => renderSection(sectionId))}
        </div>
      </div>

      {/* Local Style override for Print media to prevent scale rendering in PDF */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          #cv-print-wrapper {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }
          #cv-print-area {
            transform: none !important;
            position: relative !important;
            left: auto !important;
            transform-origin: none !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}} />

      {/* Floating Minimalist Zoom Toolbar */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg p-1 px-2 backdrop-blur-sm print:hidden">
        <button 
          onClick={() => {
            const currentScale = scale;
            setZoom(Math.max(0.4, Number((currentScale - 0.1).toFixed(1))));
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-550 hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
          title="Reducir Zoom"
        >
          –
        </button>
        <span className="text-[10.5px] font-bold text-zinc-650 dark:text-zinc-350 min-w-[34px] text-center select-none">
          {Math.round(scale * 100)}%
        </span>
        <button 
          onClick={() => {
            const currentScale = scale;
            setZoom(Math.min(1.3, Number((currentScale + 0.1).toFixed(1))));
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-550 hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
          title="Aumentar Zoom"
        >
          +
        </button>
        <div className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
        <button 
          onClick={() => setZoom('fit')}
          className={`px-2 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer border-none bg-transparent ${
            zoom === 'fit' 
              ? 'text-black dark:text-white font-black' 
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
          title="Ajustar al Ancho"
        >
          Ajustar
        </button>
      </div>
    </div>
  );
};
