import React from 'react';
import { useCVStore } from '../../lib/store';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

// Dnd Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EditPanelProps {
  className?: string;
}

interface SortableAccordionItemProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

const SortableAccordionItem: React.FC<SortableAccordionItemProps> = ({ id, title, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <AccordionItem 
        value={id} 
        className="border border-zinc-200/80 rounded-lg px-4 dark:border-zinc-800 bg-white dark:bg-zinc-950/60"
      >
        <div className="flex items-center w-full">
          {/* Drag Handle */}
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mr-2 shrink-0 select-none"
            title="Arrastrar para reordenar sección"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
            </svg>
          </div>
          <AccordionTrigger className="flex-1 font-semibold text-sm hover:no-underline py-3 text-left">
            {title}
          </AccordionTrigger>
        </div>
        <AccordionContent className="space-y-4 pt-2 pb-4">
          {children}
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

const ATS_KEYWORDS: Record<string, string[]> = {
  software: ['React', 'Node.js', 'TypeScript', 'API REST', 'Git', 'CI/CD', 'SQL', 'Docker', 'AWS', 'Agile', 'Java', 'Python', 'Jest', 'NoSQL', 'GraphQL', 'Linux', 'Kubernetes'],
  marketing: ['SEO', 'SEM', 'Google Analytics', 'Growth Hacking', 'Email Marketing', 'CRM', 'Inbound Marketing', 'Figma', 'Copywriting', 'Content Strategy', 'Social Media', 'A/B Testing', 'Lead Gen', 'PPC'],
  admin: ['Contabilidad', 'Excel Avanzado', 'Presupuestos', 'Facturación', 'ERP', 'Análisis de Datos', 'KPIs', 'Project Management', 'Planificación', 'Negociación', 'Auditoría', 'SAP'],
  design: ['Figma', 'Design Systems', 'Wireframing', 'Adobe CC', 'User Research', 'Prototipado', 'Webflow', 'UI Design', 'UX Design', 'Interaction Design', 'Illustrator', 'Photoshop'],
  support: ['Atención al Cliente', 'CRM', 'Troubleshooting', 'ITIL', 'Slack', 'Gestión de Incidencias', 'Helpdesk', 'Technical Support', 'Soporte Técnico', 'Windows Server', 'Jira']
};

const getProfessionCategory = (title: string = ''): string => {
  const t = title.toLowerCase();
  if (t.includes('soft') || t.includes('dev') || t.includes('backend') || t.includes('frontend') || t.includes('program') || t.includes('sistem') || t.includes('informát') || t.includes('fullstack') || t.includes('tech') || t.includes('python') || t.includes('javascript') || t.includes('web') || t.includes('código')) {
    return 'software';
  }
  if (t.includes('market') || t.includes('seo') || t.includes('ventas') || t.includes('growth') || t.includes('social') || t.includes('publici') || t.includes('sem') || t.includes('comercial') || t.includes('ppc')) {
    return 'marketing';
  }
  if (t.includes('diseñ') || t.includes('design') || t.includes('ux') || t.includes('ui') || t.includes('webflow') || t.includes('figma') || t.includes('gráfic') || t.includes('creativ')) {
    return 'design';
  }
  if (t.includes('admin') || t.includes('finan') || t.includes('contad') || t.includes('excel') || t.includes('presup') || t.includes('factur') || t.includes('gerent') || t.includes('manag') || t.includes('proyect') || t.includes('recurs') || t.includes('rrhh') || t.includes('talent')) {
    return 'admin';
  }
  if (t.includes('soport') || t.includes('client') || t.includes('help') || t.includes('operac') || t.includes('support') || t.includes('servici') || t.includes('atención') || t.includes('incidenc')) {
    return 'support';
  }
  return 'software';
};

export const EditPanel: React.FC<EditPanelProps> = ({ className = '' }) => {
  const {
    content,
    updatePersonal,
    updateSummary,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    updateSkills,
    addProject,
    updateProject,
    deleteProject,
    addCertification,
    updateCertification,
    deleteCertification,
    addLanguage,
    updateLanguage,
    deleteLanguage,
    setSectionOrder
  } = useCVStore();

  const { personal, summary, experience, education, skills, projects, certifications, languages, sectionOrder } = content;

  // Configuración de sensores para DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 50,
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id as string);
      const newIndex = sectionOrder.indexOf(over.id as string);
      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
      setSectionOrder(newOrder);
    }
  };

  // Diccionario de secciones renderizables
  const sectionMap: Record<string, { title: string; render: () => React.ReactNode }> = {
    personal: {
      title: 'Información Personal',
      render: () => (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input 
              id="name" 
              value={personal.name} 
              onChange={(e) => updatePersonal({ name: e.target.value })} 
              placeholder="Juan Pérez"
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="title">Profesión / Título</Label>
            <Input 
              id="title" 
              value={personal.title} 
              onChange={(e) => updatePersonal({ title: e.target.value })} 
              placeholder="Desarrollador Fullstack"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input 
              id="email" 
              value={personal.email} 
              onChange={(e) => updatePersonal({ email: e.target.value })} 
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input 
              id="phone" 
              value={personal.phone} 
              onChange={(e) => updatePersonal({ phone: e.target.value })} 
              placeholder="+506 8888-8888"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Sitio Web / Link</Label>
            <Input 
              id="website" 
              value={personal.website} 
              onChange={(e) => updatePersonal({ website: e.target.value })} 
              placeholder="https://miportafolio.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Ubicación</Label>
            <Input 
              id="location" 
              value={personal.location} 
              onChange={(e) => updatePersonal({ location: e.target.value })} 
              placeholder="San José, Costa Rica"
            />
          </div>
        </div>
      )
    },
    summary: {
      title: 'Resumen Profesional',
      render: () => (
        <div className="space-y-2">
          <Label htmlFor="summary-text">Breve descripción de tu perfil</Label>
          <Textarea 
            id="summary-text" 
            value={summary} 
            onChange={(e) => updateSummary(e.target.value)} 
            placeholder="Escribe un resumen profesional de 3-4 líneas optimizado para tu industria..."
            className="min-h-[120px]"
          />
        </div>
      )
    },
    experience: {
      title: 'Experiencia Laboral',
      render: () => (
        <div className="space-y-4">
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={exp.id} className="p-3 border border-zinc-200 rounded-md space-y-3 dark:border-zinc-800 bg-zinc-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500">Puesto #{index + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => deleteExperience(exp.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2">
                    Eliminar
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>Empresa</Label>
                    <Input value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} placeholder="Google" />
                  </div>
                  <div className="space-y-1">
                    <Label>Rol</Label>
                    <Input value={exp.role} onChange={(e) => updateExperience(exp.id, { role: e.target.value })} placeholder="Software Engineer" />
                  </div>
                  <div className="space-y-1">
                    <Label>Inicio</Label>
                    <Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} placeholder="2022-01" />
                  </div>
                  <div className="space-y-1">
                    <Label>Fin</Label>
                    <Input value={exp.endDate} onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })} placeholder="2024-05" disabled={exp.current} />
                  </div>
                  <div className="col-span-2 flex items-center gap-2 py-1">
                    <input 
                      type="checkbox" 
                      id={`curr-${exp.id}`} 
                      checked={exp.current} 
                      onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: e.target.checked ? '' : exp.endDate })} 
                    />
                    <Label htmlFor={`curr-${exp.id}`} className="cursor-pointer">Actualmente trabajo aquí</Label>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label>Descripción de logros</Label>
                    <Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, { description: e.target.value })} placeholder="Lideré el desarrollo de..." className="min-h-[80px]" />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full border-dashed dark:border-zinc-800" onClick={addExperience}>
              + Añadir Experiencia
            </Button>
          </div>
        </div>
      )
    },
    education: {
      title: 'Educación',
      render: () => (
        <div className="space-y-4">
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={edu.id} className="p-3 border border-zinc-200 rounded-md space-y-3 dark:border-zinc-800 bg-zinc-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500">Estudios #{index + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => deleteEducation(edu.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2">
                    Eliminar
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2 space-y-1">
                    <Label>Institución</Label>
                    <Input value={edu.school} onChange={(e) => updateEducation(edu.id, { school: e.target.value })} placeholder="Universidad X" />
                  </div>
                  <div className="space-y-1">
                    <Label>Grado</Label>
                    <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} placeholder="Bachillerato" />
                  </div>
                  <div className="space-y-1">
                    <Label>Área de Estudio</Label>
                    <Input value={edu.field} onChange={(e) => updateEducation(edu.id, { field: e.target.value })} placeholder="Ingeniería Civil" />
                  </div>
                  <div className="space-y-1">
                    <Label>Inicio</Label>
                    <Input value={edu.startDate} onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })} placeholder="2018" />
                  </div>
                  <div className="space-y-1">
                    <Label>Fin</Label>
                    <Input value={edu.endDate} onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })} placeholder="2022" />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full border-dashed dark:border-zinc-800" onClick={addEducation}>
              + Añadir Educación
            </Button>
          </div>
        </div>
      )
    },
    skills: {
      title: 'Habilidades',
      render: () => {
        const category = getProfessionCategory(personal.title);
        const suggestedKeywords = ATS_KEYWORDS[category] || [];
        const remainingSuggestions = suggestedKeywords.filter(
          keyword => !skills.some(s => s.toLowerCase() === keyword.toLowerCase())
        );

        return (
          <div className="space-y-2">
            <Label htmlFor="skills-input">Habilidades (separadas por comas)</Label>
            <Input 
              id="skills-input" 
              value={skills.join(', ')} 
              onChange={(e) => updateSkills(e.target.value.split(',').map(s => s.trim()).filter(s => s !== ''))} 
              placeholder="React, Node.js, TypeScript, Docker"
            />
            <span className="text-[10px] text-zinc-400 block mt-1">Escribe tus habilidades separadas por comas para listarlas automáticamente en el CV.</span>

            {remainingSuggestions.length > 0 && (
              <div className="space-y-1.5 mt-3 border-t border-zinc-100 pt-2.5 dark:border-zinc-800/40">
                <Label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                  Palabras Clave ATS recomendadas para "{personal.title || 'tu perfil'}" (Toca para añadir)
                </Label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {remainingSuggestions.slice(0, 10).map((keyword) => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => {
                        const updatedSkills = [...skills.filter(s => s.trim() !== ''), keyword];
                        updateSkills(updatedSkills);
                      }}
                      className="px-2 py-0.5 rounded bg-zinc-150 hover:bg-zinc-200 text-zinc-700 text-[10px] font-semibold border border-zinc-200/50 hover:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-white transition-all cursor-pointer select-none active:scale-[0.95]"
                    >
                      + {keyword}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
    },
    projects: {
      title: 'Proyectos',
      render: () => (
        <div className="space-y-4">
          <div className="space-y-4">
            {projects.map((proj, index) => (
              <div key={proj.id} className="p-3 border border-zinc-200 rounded-md space-y-3 dark:border-zinc-800 bg-zinc-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500">Proyecto #{index + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => deleteProject(proj.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2">
                    Eliminar
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>Nombre</Label>
                    <Input value={proj.name} onChange={(e) => updateProject(proj.id, { name: e.target.value })} placeholder="CVForge" />
                  </div>
                  <div className="space-y-1">
                    <Label>Rol</Label>
                    <Input value={proj.role} onChange={(e) => updateProject(proj.id, { role: e.target.value })} placeholder="Creador principal" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label>Enlace del proyecto</Label>
                    <Input value={proj.link} onChange={(e) => updateProject(proj.id, { link: e.target.value })} placeholder="https://github.com/cvforge" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label>Descripción</Label>
                    <Textarea value={proj.description} onChange={(e) => updateProject(proj.id, { description: e.target.value })} placeholder="Detalles de lo desarrollado..." className="min-h-[60px]" />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full border-dashed dark:border-zinc-800" onClick={addProject}>
              + Añadir Proyecto
            </Button>
          </div>
        </div>
      )
    },
    languages: {
      title: 'Idiomas',
      render: () => (
        <div className="space-y-4">
          <div className="space-y-3">
            {languages.map((lang) => (
              <div key={lang.id} className="flex gap-2 items-center">
                <Input value={lang.name} onChange={(e) => updateLanguage(lang.id, { name: e.target.value })} placeholder="Inglés" className="flex-2" />
                <Input value={lang.proficiency} onChange={(e) => updateLanguage(lang.id, { proficiency: e.target.value })} placeholder="C1" className="flex-1" />
                <Button variant="ghost" size="sm" onClick={() => deleteLanguage(lang.id)} className="text-red-500 hover:bg-red-50 px-2 h-9">
                  X
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full border-dashed dark:border-zinc-800" onClick={addLanguage}>
              + Añadir Idioma
            </Button>
          </div>
        </div>
      )
    },
    certifications: {
      title: 'Certificaciones',
      render: () => (
        <div className="space-y-4">
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <div key={cert.id} className="p-3 border border-zinc-200 rounded-md space-y-3 dark:border-zinc-800 bg-zinc-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500">Certificación #{index + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => deleteCertification(cert.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2">
                    Eliminar
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2 space-y-1">
                    <Label>Nombre de la Certificación</Label>
                    <Input value={cert.name} onChange={(e) => updateCertification(cert.id, { name: e.target.value })} placeholder="AWS Cloud Practitioner" />
                  </div>
                  <div className="space-y-1">
                    <Label>Organización Emisora</Label>
                    <Input value={cert.issuer} onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })} placeholder="Amazon Web Services" />
                  </div>
                  <div className="space-y-1">
                    <Label>Fecha de Emisión</Label>
                    <Input value={cert.date} onChange={(e) => updateCertification(cert.id, { date: e.target.value })} placeholder="2024-05" />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full border-dashed dark:border-zinc-800" onClick={addCertification}>
              + Añadir Certificación
            </Button>
          </div>
        </div>
      )
    }
  };

  return (
    <div className={`w-full lg:w-[480px] xl:w-[540px] border-r border-zinc-200 bg-white flex flex-col h-full overflow-hidden dark:border-zinc-800 dark:bg-zinc-950 ${className}`}>
      <div className="p-4 border-b border-zinc-150 flex items-center justify-between dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
        <h2 className="text-base font-bold">Editor de Datos</h2>
        <span className="text-xs text-zinc-500">Auto-guardado local</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sectionOrder}
            strategy={verticalListSortingStrategy}
          >
            <Accordion type="multiple" defaultValue={["personal"]} className="w-full space-y-4">
              {sectionOrder.map((sectionId) => {
                const section = sectionMap[sectionId];
                if (!section) return null;
                return (
                  <SortableAccordionItem 
                    key={sectionId} 
                    id={sectionId} 
                    title={section.title}
                  >
                    {section.render()}
                  </SortableAccordionItem>
                );
              })}
            </Accordion>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
