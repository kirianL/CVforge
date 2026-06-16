import React from 'react';
import { useCVStore } from '../../lib/store';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

export const EditPanel: React.FC = () => {
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
    deleteLanguage
  } = useCVStore();

  const { personal, summary, experience, education, skills, projects, certifications, languages } = content;

  return (
    <div className="w-full lg:w-[480px] xl:w-[540px] border-r border-zinc-200 bg-white flex flex-col h-full overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
      <div className="p-4 border-b border-zinc-150 flex items-center justify-between dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
        <h2 className="text-base font-bold">Editor de Datos</h2>
        <span className="text-xs text-zinc-500">Auto-guardado local</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 select-none">
        <Accordion type="single" collapsible defaultValue="personal" className="w-full space-y-4">
          
          {/* Información Personal */}
          <AccordionItem value="personal" className="border border-zinc-200/80 rounded-lg px-4 dark:border-zinc-800">
            <AccordionTrigger className="font-semibold text-sm hover:no-underline py-3">Información Personal</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2 pb-4">
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
            </AccordionContent>
          </AccordionItem>

          {/* Perfil Profesional */}
          <AccordionItem value="summary" className="border border-zinc-200/80 rounded-lg px-4 dark:border-zinc-800">
            <AccordionTrigger className="font-semibold text-sm hover:no-underline py-3">Resumen Profesional</AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2 pb-4">
              <Label htmlFor="summary-text">Breve descripción de tu perfil</Label>
              <Textarea 
                id="summary-text" 
                value={summary} 
                onChange={(e) => updateSummary(e.target.value)} 
                placeholder="Escribe un resumen profesional de 3-4 líneas optimizado para tu industria..."
                className="min-h-[120px]"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Experiencia Laboral */}
          <AccordionItem value="experience" className="border border-zinc-200/80 rounded-lg px-4 dark:border-zinc-800">
            <AccordionTrigger className="font-semibold text-sm hover:no-underline py-3">Experiencia Laboral</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2 pb-4">
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
                <Button variant="outline" size="sm" className="w-full border-dashed" onClick={addExperience}>
                  + Añadir Experiencia
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Educación */}
          <AccordionItem value="education" className="border border-zinc-200/80 rounded-lg px-4 dark:border-zinc-800">
            <AccordionTrigger className="font-semibold text-sm hover:no-underline py-3">Educación</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2 pb-4">
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
                <Button variant="outline" size="sm" className="w-full border-dashed" onClick={addEducation}>
                  + Añadir Educación
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Habilidades */}
          <AccordionItem value="skills" className="border border-zinc-200/80 rounded-lg px-4 dark:border-zinc-800">
            <AccordionTrigger className="font-semibold text-sm hover:no-underline py-3">Habilidades</AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2 pb-4">
              <Label htmlFor="skills-input">Habilidades (separadas por comas)</Label>
              <Input 
                id="skills-input" 
                value={skills.join(', ')} 
                onChange={(e) => updateSkills(e.target.value.split(',').map(s => s.trim()))} 
                placeholder="React, Node.js, TypeScript, Docker"
              />
              <span className="text-[10px] text-zinc-400 block mt-1">Escribe tus habilidades separadas por comas para listarlas automáticamente en el CV.</span>
            </AccordionContent>
          </AccordionItem>

          {/* Proyectos */}
          <AccordionItem value="projects" className="border border-zinc-200/80 rounded-lg px-4 dark:border-zinc-800">
            <AccordionTrigger className="font-semibold text-sm hover:no-underline py-3">Proyectos</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2 pb-4">
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
                <Button variant="outline" size="sm" className="w-full border-dashed" onClick={addProject}>
                  + Añadir Proyecto
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Idiomas */}
          <AccordionItem value="languages" className="border border-zinc-200/80 rounded-lg px-4 dark:border-zinc-800">
            <AccordionTrigger className="font-semibold text-sm hover:no-underline py-3">Idiomas</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2 pb-4">
              <div className="space-y-3">
                {languages.map((lang, index) => (
                  <div key={lang.id} className="flex gap-2 items-center">
                    <Input value={lang.name} onChange={(e) => updateLanguage(lang.id, { name: e.target.value })} placeholder="Inglés" className="flex-2" />
                    <Input value={lang.proficiency} onChange={(e) => updateLanguage(lang.id, { proficiency: e.target.value })} placeholder="C1" className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={() => deleteLanguage(lang.id)} className="text-red-500 hover:bg-red-50 px-2 h-9">
                      X
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full border-dashed" onClick={addLanguage}>
                  + Añadir Idioma
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Certificaciones */}
          <AccordionItem value="certifications" className="border border-zinc-200/80 rounded-lg px-4 dark:border-zinc-800">
            <AccordionTrigger className="font-semibold text-sm hover:no-underline py-3">Certificaciones</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2 pb-4">
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
                <Button variant="outline" size="sm" className="w-full border-dashed" onClick={addCertification}>
                  + Añadir Certificación
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </div>
  );
};
