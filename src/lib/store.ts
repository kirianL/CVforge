import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  location: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  link: string;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string; // ej: "Nativo", "C1", "B2"
}

export interface CVContent {
  personal: PersonalInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  sectionOrder: string[];
}

interface HistoryState {
  past: CVContent[];
  future: CVContent[];
}

interface CVStore {
  content: CVContent;
  history: HistoryState;
  
  // Acciones
  updatePersonal: (data: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  
  // Listas
  addExperience: () => void;
  updateExperience: (id: string, data: Partial<WorkExperience>) => void;
  deleteExperience: (id: string) => void;
  
  addEducation: () => void;
  updateEducation: (id: string, data: Partial<Education>) => void;
  deleteEducation: (id: string) => void;
  
  updateSkills: (skills: string[]) => void;
  
  addProject: () => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addCertification: () => void;
  updateCertification: (id: string, data: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;

  addLanguage: () => void;
  updateLanguage: (id: string, data: Partial<Language>) => void;
  deleteLanguage: (id: string) => void;
  
  // Reordenar
  setSectionOrder: (order: string[]) => void;
  
  // Historial
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;

  setInitialContent: (content: CVContent) => void;
}

const initialContent: CVContent = {
  personal: {
    name: 'Juan Pérez',
    title: 'Desarrollador Fullstack',
    email: 'juan.perez@email.com',
    phone: '+506 8888-8888',
    website: 'https://juanperez.dev',
    location: 'San José, Costa Rica',
  },
  summary: 'Profesional enfocado en la creación de aplicaciones web escalables y eficientes. Experiencia trabajando con metodologías ágiles, bases de datos relacionales y tecnologías modernas del ecosistema de JavaScript.',
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Solutions S.A.',
      role: 'Desarrollador Fullstack Senior',
      startDate: '2023-01',
      endDate: '',
      current: true,
      description: 'Lideré la migración de microservicios, mejorando el rendimiento de carga en un 40%. Colaboré activamente en el diseño de arquitecturas cloud con AWS.',
    }
  ],
  education: [
    {
      id: 'edu-1',
      school: 'Universidad de Costa Rica',
      degree: 'Bachillerato',
      field: 'Ingeniería del Software',
      startDate: '2018',
      endDate: '2022',
      current: false,
    }
  ],
  skills: ['TypeScript', 'React', 'Node.js', 'Next.js', 'PostgreSQL', 'TailwindCSS', 'Docker'],
  projects: [
    {
      id: 'proj-1',
      name: 'CVForge',
      role: 'Creador principal',
      link: 'https://github.com/user/cvforge',
      description: 'Plataforma para generar hojas de vida optimizadas para ATS de forma ágil y responsiva.',
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      date: '2024-05',
    }
  ],
  languages: [
    {
      id: 'lang-1',
      name: 'Español',
      proficiency: 'Nativo',
    },
    {
      id: 'lang-2',
      name: 'Inglés',
      proficiency: 'C1 - Avanzado',
    }
  ],
  sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'languages', 'certifications'],
};

export const useCVStore = create<CVStore>()(
  immer((set, get) => ({
    content: initialContent,
    history: { past: [], future: [] },

    setInitialContent: (loadedContent) => {
      set((state) => {
        state.content = {
          ...initialContent,
          ...loadedContent,
          personal: {
            ...initialContent.personal,
            ...(loadedContent?.personal || {}),
          },
          experience: loadedContent?.experience || [],
          education: loadedContent?.education || [],
          skills: loadedContent?.skills || [],
          projects: loadedContent?.projects || [],
          certifications: loadedContent?.certifications || [],
          languages: loadedContent?.languages || [],
          sectionOrder: loadedContent?.sectionOrder || initialContent.sectionOrder,
        };
        state.history = { past: [], future: [] };
      });
    },

    saveHistory: () => {
      set((state) => {
        state.history.past.push(JSON.parse(JSON.stringify(state.content)));
        state.history.future = []; // Limpiamos el futuro al realizar un cambio
        // Limitar historial a 30 pasos para evitar consumo excesivo de memoria
        if (state.history.past.length > 30) {
          state.history.past.shift();
        }
      });
    },

    undo: () => {
      set((state) => {
        const previous = state.history.past.pop();
        if (previous) {
          state.history.future.push(JSON.parse(JSON.stringify(state.content)));
          state.content = previous;
        }
      });
    },

    redo: () => {
      set((state) => {
        const next = state.history.future.pop();
        if (next) {
          state.history.past.push(JSON.parse(JSON.stringify(state.content)));
          state.content = next;
        }
      });
    },

    updatePersonal: (data) => {
      get().saveHistory();
      set((state) => {
        state.content.personal = { ...state.content.personal, ...data };
      });
    },

    updateSummary: (summary) => {
      get().saveHistory();
      set((state) => {
        state.content.summary = summary;
      });
    },

    addExperience: () => {
      get().saveHistory();
      set((state) => {
        state.content.experience.push({
          id: `exp-${Date.now()}`,
          company: 'Nueva Empresa',
          role: 'Nuevo Rol',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        });
      });
    },

    updateExperience: (id, data) => {
      get().saveHistory();
      set((state) => {
        const index = state.content.experience.findIndex((e) => e.id === id);
        if (index !== -1) {
          state.content.experience[index] = { ...state.content.experience[index], ...data };
        }
      });
    },

    deleteExperience: (id) => {
      get().saveHistory();
      set((state) => {
        state.content.experience = state.content.experience.filter((e) => e.id !== id);
      });
    },

    addEducation: () => {
      get().saveHistory();
      set((state) => {
        state.content.education.push({
          id: `edu-${Date.now()}`,
          school: 'Nueva Institución',
          degree: 'Título',
          field: 'Área de estudio',
          startDate: '',
          endDate: '',
          current: false,
        });
      });
    },

    updateEducation: (id, data) => {
      get().saveHistory();
      set((state) => {
        const index = state.content.education.findIndex((e) => e.id === id);
        if (index !== -1) {
          state.content.education[index] = { ...state.content.education[index], ...data };
        }
      });
    },

    deleteEducation: (id) => {
      get().saveHistory();
      set((state) => {
        state.content.education = state.content.education.filter((e) => e.id !== id);
      });
    },

    updateSkills: (skills) => {
      get().saveHistory();
      set((state) => {
        state.content.skills = skills;
      });
    },

    addProject: () => {
      get().saveHistory();
      set((state) => {
        state.content.projects.push({
          id: `proj-${Date.now()}`,
          name: 'Nuevo Proyecto',
          role: 'Rol',
          link: '',
          description: '',
        });
      });
    },

    updateProject: (id, data) => {
      get().saveHistory();
      set((state) => {
        const index = state.content.projects.findIndex((p) => p.id === id);
        if (index !== -1) {
          state.content.projects[index] = { ...state.content.projects[index], ...data };
        }
      });
    },

    deleteProject: (id) => {
      get().saveHistory();
      set((state) => {
        state.content.projects = state.content.projects.filter((p) => p.id !== id);
      });
    },

    addCertification: () => {
      get().saveHistory();
      set((state) => {
        state.content.certifications.push({
          id: `cert-${Date.now()}`,
          name: 'Certificación',
          issuer: 'Emisor',
          date: '',
        });
      });
    },

    updateCertification: (id, data) => {
      get().saveHistory();
      set((state) => {
        const index = state.content.certifications.findIndex((c) => c.id === id);
        if (index !== -1) {
          state.content.certifications[index] = { ...state.content.certifications[index], ...data };
        }
      });
    },

    deleteCertification: (id) => {
      get().saveHistory();
      set((state) => {
        state.content.certifications = state.content.certifications.filter((c) => c.id !== id);
      });
    },

    addLanguage: () => {
      get().saveHistory();
      set((state) => {
        state.content.languages.push({
          id: `lang-${Date.now()}`,
          name: 'Idioma',
          proficiency: 'Nivel',
        });
      });
    },

    updateLanguage: (id, data) => {
      get().saveHistory();
      set((state) => {
        const index = state.content.languages.findIndex((l) => l.id === id);
        if (index !== -1) {
          state.content.languages[index] = { ...state.content.languages[index], ...data };
        }
      });
    },

    deleteLanguage: (id) => {
      get().saveHistory();
      set((state) => {
        state.content.languages = state.content.languages.filter((l) => l.id !== id);
      });
    },

    setSectionOrder: (order) => {
      get().saveHistory();
      set((state) => {
        state.content.sectionOrder = order;
      });
    },
  }))
);
