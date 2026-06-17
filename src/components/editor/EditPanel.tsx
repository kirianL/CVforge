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

const getSectionIcon = (id: string) => {
  switch (id) {
    case 'personal':
      return (
        <svg viewBox="52 123 34 34" className="w-4 h-4 shrink-0 text-zinc-550 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path opacity="0.12" d="M76 125H62C59.1997 125 57.7996 125 56.73 125.545C55.7892 126.024 55.0243 126.789 54.545 127.73C54 128.8 54 130.2 54 133V135H84V133C84 130.2 84 128.8 83.455 127.73C82.9757 126.789 82.2108 126.024 81.27 125.545C80.2004 125 78.8003 125 76 125Z" fill="currentColor"/>
          <path d="M54 135H84M62 125H76C78.8003 125 80.2004 125 81.27 125.545C82.2108 126.024 82.9757 126.789 83.455 127.73C84 128.8 84 130.2 84 133V147C84 149.8 84 151.2 83.455 152.27C82.9757 153.211 82.2108 153.976 81.27 154.455C80.2004 155 78.8003 155 76 155H62C59.1997 155 57.7996 155 56.73 154.455C55.7892 153.976 55.0243 153.211 54.545 152.27C54 151.2 54 149.8 54 147V133C54 130.2 54 128.8 54.545 127.73C55.0243 126.789 55.7892 126.024 56.73 125.545C57.7996 125 59.1997 125 62 125Z" />
        </svg>
      );
    case 'summary':
      return (
        <svg viewBox="1103 41 37 37" className="w-4 h-4 shrink-0 text-zinc-550 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path opacity="0.12" d="M1127.89 65.8925C1126.38 67.4006 1124.3 68.3333 1122 68.3333C1119.7 68.3333 1117.62 67.4006 1116.11 65.8926L1110.21 71.7851C1116.72 78.2938 1127.28 78.2938 1133.79 71.7851L1127.89 65.8925Z" fill="currentColor"/>
          <path opacity="0.12" d="M1116.11 54.1075C1117.62 52.5994 1119.7 51.6667 1122 51.6667C1124.3 51.6667 1126.38 52.5994 1127.89 54.1074L1133.79 48.2149C1127.28 41.7061 1116.72 41.7061 1110.21 48.2149L1116.11 54.1075Z" fill="currentColor"/>
          <path d="M1116.11 54.1075L1110.21 48.2149M1110.21 71.7852L1116.11 65.8926M1127.89 65.8925L1133.79 71.7851M1133.79 48.2148L1127.89 54.1074M1138.67 60C1138.67 69.2047 1131.2 76.6667 1122 76.6667C1112.8 76.6667 1105.33 69.2047 1105.33 60C1105.33 50.7953 1112.8 43.3333 1122 43.3333C1131.2 43.3333 1138.67 50.7953 1138.67 60ZM1130.33 60C1130.33 64.6024 1126.6 68.3333 1122 68.3333C1117.4 68.3333 1113.67 64.6024 1113.67 60C1113.67 55.3976 1117.4 51.6667 1122 51.6667C1126.6 51.6667 1130.33 55.3976 1130.33 60Z" />
        </svg>
      );
    case 'experience':
      return (
        <svg viewBox="1753 43 34 34" className="w-4 h-4 shrink-0 text-zinc-550 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path opacity="0.12" d="M1777 75C1779.8 75 1781.2 75 1782.27 74.455C1783.21 73.9757 1783.98 73.2108 1784.46 72.27C1785 71.2004 1785 69.8003 1785 67V53C1785 50.1997 1785 48.7996 1784.46 47.7301C1783.98 46.7892 1783.21 46.0243 1782.27 45.545C1781.2 45 1779.8 45 1777 45L1763 45C1760.2 45 1758.8 45 1757.73 45.545C1756.79 46.0243 1756.02 46.7892 1755.54 47.73C1755 48.7996 1755 50.1997 1755 53L1755 67C1755 69.8003 1755 71.2004 1755.54 72.2699C1756.02 73.2108 1756.79 73.9757 1757.73 74.455C1758.8 75 1760.2 75 1763 75H1777Z" fill="currentColor"/>
          <path d="M1779.17 69.3333L1760.83 69.3333M1763 45H1777C1779.8 45 1781.2 45 1782.27 45.545C1783.21 46.0243 1783.98 46.7892 1784.46 47.73C1785 48.7996 1785 50.1997 1785 53V67C1785 69.8003 1785 71.2004 1784.46 72.27C1783.98 73.2108 1783.21 73.9757 1782.27 74.455C1781.2 75 1779.8 75 1777 75H1763C1760.2 75 1758.8 75 1757.73 74.455C1756.79 73.9757 1756.02 73.2108 1755.54 72.27C1755 71.2004 1755 69.8003 1755 67V53C1755 50.1997 1755 48.7996 1755.54 47.73C1756.02 46.7892 1756.79 46.0243 1757.73 45.545C1758.8 45 1760.2 45 1763 45Z" />
        </svg>
      );
    case 'education':
      return (
        <svg viewBox="1184 121 37 37" className="w-4 h-4 shrink-0 text-zinc-555 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path opacity="0.12" d="M1203 156.667C1212.2 156.667 1219.67 149.205 1219.67 140C1219.67 130.795 1212.2 123.333 1203 123.333C1193.8 123.333 1186.33 130.795 1186.33 140C1186.33 149.205 1193.8 156.667 1203 156.667Z" fill="currentColor"/>
          <path d="M1198.83 132.5H1205.92C1207.99 132.5 1209.67 134.179 1209.67 136.25C1209.67 138.321 1207.99 140 1205.92 140H1198.83H1206.75C1208.82 140 1210.5 141.679 1210.5 143.75C1210.5 145.821 1208.82 147.5 1206.75 147.5H1198.83M1198.83 132.5H1196.33M1198.83 132.5V147.5M1198.83 147.5H1196.33M1199.67 130V132.5M1199.67 147.5V150M1204.67 130V132.5M1204.67 147.5V150M1219.67 140C1219.67 149.205 1212.2 156.667 1203 156.667C1193.8 156.667 1186.33 149.205 1186.33 140C1186.33 130.795 1193.8 123.333 1203 123.333C1212.2 123.333 1219.67 130.795 1219.67 140Z" />
        </svg>
      );
    case 'skills':
      return (
        <svg viewBox="1022 43 37 34" className="w-4 h-4 shrink-0 text-zinc-555 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path opacity="0.12" d="M1049.33 45L1038.34 60.3917C1037.85 61.0729 1037.61 61.4136 1037.62 61.6975C1037.63 61.9448 1037.75 62.1752 1037.94 62.3264C1038.17 62.5 1038.59 62.5 1039.42 62.5H1047.67L1046 75L1056.99 59.6083C1057.48 58.9271 1057.72 58.5864 1057.71 58.3025C1057.7 58.0552 1057.59 57.8248 1057.39 57.6736C1057.16 57.5 1056.75 57.5 1055.91 57.5H1047.67L1049.33 45Z" fill="currentColor"/>
          <path d="M1036 69.1667H1026.83M1031.83 60H1024.33M1036 50.8333H1027.67M1049.33 45L1038.34 60.3917C1037.85 61.0729 1037.61 61.4136 1037.62 61.6975C1037.63 61.9448 1037.75 62.1752 1037.94 62.3264C1038.17 62.5 1038.59 62.5 1039.42 62.5H1047.67L1046 75L1056.99 59.6083C1057.48 58.9271 1057.72 58.5864 1057.71 58.3025C1057.7 58.0552 1057.59 57.8248 1057.39 57.6736C1057.16 57.5 1056.75 57.5 1055.91 57.5H1047.67L1049.33 45Z" />
        </svg>
      );
    case 'projects':
      return (
        <svg viewBox="1429 41 34 37" className="w-4 h-4 shrink-0 text-zinc-555 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path opacity="0.12" d="M1446 60L1461 51.6667V66.7643C1461 67.3353 1461 67.6209 1460.92 67.8755C1460.84 68.1008 1460.72 68.3076 1460.56 68.4821C1460.38 68.6793 1460.13 68.818 1459.63 69.0953L1447.3 75.9472C1446.82 76.2098 1446.59 76.3411 1446.34 76.3926C1446.11 76.4381 1445.89 76.4381 1445.66 76.3926C1445.41 76.3411 1445.18 76.2098 1444.7 75.9472L1432.37 69.0953C1431.87 68.818 1431.62 68.6793 1431.44 68.4821C1431.28 68.3076 1431.16 68.1008 1431.08 67.8755C1431 67.6209 1431 67.3353 1431 66.7643V51.6667L1446 60Z" fill="currentColor"/>
          <path d="M1460.17 52.1295L1446 59.9999M1446 59.9999L1431.83 52.1295M1446 59.9999L1446 75.8333M1461 66.7642V53.2357C1461 52.6646 1461 52.3791 1460.92 52.1244C1460.84 51.8991 1460.72 51.6923 1460.56 51.5178C1460.38 51.3206 1460.13 51.1819 1459.63 50.9046L1447.3 44.0527C1446.82 43.7901 1446.59 43.6588 1446.34 43.6074C1446.11 43.5618 1445.89 43.5618 1445.66 43.6074C1445.41 43.6588 1445.18 43.7901 1444.7 44.0527L1432.37 50.9046C1431.87 51.1819 1431.62 51.3206 1431.44 51.5178C1431.28 51.6923 1431.16 51.8991 1431.08 52.1244C1431 52.3791 1431 52.6646 1431 53.2357V66.7642C1431 67.3353 1431 67.6209 1431.08 67.8755C1431.16 68.1008 1431.28 68.3076 1431.44 68.482C1431.62 68.6793 1431.87 68.8179 1432.37 69.0953L1444.7 75.9471C1445.18 76.2097 1445.41 76.341 1445.66 76.3925C1445.89 76.4381 1446.11 76.4381 1446.34 76.3925C1446.59 76.341 1446.82 76.2097 1447.3 75.9471L1459.63 69.0953C1460.13 68.8179 1460.38 68.6793 1460.56 68.482C1460.72 68.3076 1460.84 68.1008 1460.92 67.8755C1461 67.6208 1461 67.3353 1461 66.7642Z" />
        </svg>
      );
    case 'languages':
      return (
        <svg viewBox="1022 123 37 35" className="w-4 h-4 shrink-0 text-zinc-555 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path opacity="0.12" d="M1041 149.167C1046.06 149.167 1050.17 145.063 1050.17 140C1050.17 134.937 1046.06 130.833 1041 130.833C1035.94 130.833 1031.83 134.937 1031.83 140C1031.83 145.063 1035.94 149.167 1041 149.167Z" fill="currentColor"/>
          <path d="M1050.8 153.484C1047.95 155.552 1044.52 156.667 1041 156.667C1037.48 156.667 1034.05 155.552 1031.2 153.484M1048.31 125.02C1051.47 126.563 1054.06 129.068 1055.72 132.175C1057.37 135.283 1057.99 138.834 1057.5 142.32M1024.5 142.319C1024.01 138.834 1024.63 135.283 1026.28 132.175C1027.94 129.068 1030.53 126.563 1033.69 125.02M1050.17 140C1050.17 145.063 1046.06 149.167 1041 149.167C1035.94 149.167 1031.83 145.063 1031.83 140C1031.83 134.937 1035.94 130.833 1041 130.833C1046.06 130.833 1050.17 134.937 1050.17 140Z" />
        </svg>
      );
    case 'certifications':
      return (
        <svg viewBox="941 121 37 37" className="w-4 h-4 shrink-0 text-zinc-555 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path opacity="0.12" d="M953.333 156.667C958.856 156.667 963.333 152.19 963.333 146.667C963.333 141.144 958.856 136.667 953.333 136.667C947.81 136.667 943.333 152.19 943.333 146.667Z" fill="currentColor"/>
          <path d="M950 123.333L953.333 126.667L950 130M953.333 126.667H950C946.318 126.667 943.333 129.651 943.333 133.333M970 156.667L966.667 153.333L970 150M966.667 153.333H970C973.682 153.333 976.667 150.349 976.667 146.667M956.982 130.833C958.092 126.52 962.007 123.333 966.667 123.333C972.189 123.333 976.667 127.81 976.667 133.333C976.667 137.993 973.48 141.908 969.167 143.018M963.333 146.667C963.333 152.19 958.856 156.667 953.333 156.667C947.81 156.667 943.333 152.19 943.333 146.667Z" />
        </svg>
      );
    default:
      return null;
  }
};

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
            <svg viewBox="455 49 37 21" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path opacity="0.12" fillRule="evenodd" clipRule="evenodd" d="M465.667 51.6667C461.064 51.6667 457.333 55.3976 457.333 60C457.333 64.6024 461.064 68.3333 465.667 68.3333H482.333C477.731 68.3333 474 64.6024 474 60C474 55.3976 477.731 51.6667 482.333 51.6667H465.667Z" fill="currentColor" />
              <path d="M482.333 68.3333H465.667C461.064 68.3333 457.333 64.6024 457.333 60C457.333 55.3976 461.064 51.6667 465.667 51.6667H482.333M482.333 68.3333C486.936 68.3333 490.667 64.6024 490.667 60C490.667 55.3976 486.936 51.6667 482.333 51.6667M482.333 68.3333C477.731 68.3333 474 64.6024 474 60C474 55.3976 477.731 51.6667 482.333 51.6667" />
            </svg>
          </div>
          <AccordionTrigger className="flex-1 font-semibold text-sm hover:no-underline py-3 text-left">
            <span className="flex items-center gap-2">
              {getSectionIcon(id)}
              <span>{title}</span>
            </span>
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
  const t = (title || '').toLowerCase();
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
  return 'admin';
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
              placeholder="Ej: Administrador de Empresas / Coordinador"
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
                    <Input value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} placeholder="Ej: Corporación de Logística" />
                  </div>
                  <div className="space-y-1">
                    <Label>Rol</Label>
                    <Input value={exp.role} onChange={(e) => updateExperience(exp.id, { role: e.target.value })} placeholder="Ej: Coordinador de Proyectos" />
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
                    <Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, { description: e.target.value })} placeholder="Ej: Lideré la planificación e implementación de nuevos procesos operativos..." className="min-h-[80px]" />
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
                    <Input value={edu.school} onChange={(e) => updateEducation(edu.id, { school: e.target.value })} placeholder="Ej: Universidad de Costa Rica" />
                  </div>
                  <div className="space-y-1">
                    <Label>Grado</Label>
                    <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} placeholder="Ej: Bachillerato / Licenciatura" />
                  </div>
                  <div className="space-y-1">
                    <Label>Área de Estudio</Label>
                    <Input value={edu.field} onChange={(e) => updateEducation(edu.id, { field: e.target.value })} placeholder="Ej: Administración de Empresas" />
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
          keyword => !skills.some(s => s && s.toLowerCase() === keyword.toLowerCase())
        );

        return (
          <div className="space-y-2">
            <Label htmlFor="skills-input">Habilidades (separadas por comas)</Label>
            <Input 
              id="skills-input" 
              value={skills.join(', ')} 
              onChange={(e) => updateSkills(e.target.value.split(',').map(s => s.trim()).filter(s => s !== ''))} 
              placeholder="Ej: Gestión de Proyectos, Excel Avanzado, Liderazgo, Presupuestos"
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
                    <Input value={proj.name} onChange={(e) => updateProject(proj.id, { name: e.target.value })} placeholder="Ej: Migración de Sistema ERP" />
                  </div>
                  <div className="space-y-1">
                    <Label>Rol</Label>
                    <Input value={proj.role} onChange={(e) => updateProject(proj.id, { role: e.target.value })} placeholder="Ej: Líder de Proyecto" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label>Enlace del proyecto</Label>
                    <Input value={proj.link} onChange={(e) => updateProject(proj.id, { link: e.target.value })} placeholder="Ej: https://linkedin.com/in/juanperez" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label>Descripción</Label>
                    <Textarea value={proj.description} onChange={(e) => updateProject(proj.id, { description: e.target.value })} placeholder="Ej: Coordiné la migración y capacitación del nuevo sistema..." className="min-h-[60px]" />
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
                    <Input value={cert.name} onChange={(e) => updateCertification(cert.id, { name: e.target.value })} placeholder="Ej: Project Management Professional (PMP)" />
                  </div>
                  <div className="space-y-1">
                    <Label>Organización Emisora</Label>
                    <Input value={cert.issuer} onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })} placeholder="Ej: Project Management Institute (PMI)" />
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
