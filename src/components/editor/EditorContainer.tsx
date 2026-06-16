import React from 'react';
import { EditPanel } from './EditPanel';
import { PreviewPanel } from './PreviewPanel';
import { useCVStore } from '../../lib/store';
import { Button } from '../ui/button';

interface EditorContainerProps {
  initialResume: {
    id: string;
    title: string;
    content: any; // CVContent
  };
}

export const EditorContainer: React.FC<EditorContainerProps> = ({ initialResume }) => {
  const { undo, redo, history, content, setInitialContent } = useCVStore();
  const [cvTitle, setCvTitle] = React.useState(initialResume.title);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = React.useState<'edit' | 'preview'>('edit');
  const isFirstLoad = React.useRef(true);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Cargar contenido inicial en el store
  React.useEffect(() => {
    if (initialResume?.content) {
      setInitialContent(initialResume.content);
    }
  }, [initialResume]);

  // Autoguardado debounced
  React.useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/resumes/${initialResume.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: cvTitle,
            content: content
          })
        });

        if (!res.ok) {
          console.error("Error al guardar en base de datos");
        }
      } catch (err) {
        console.error("Error de red en autoguardado:", err);
      } finally {
        setIsSaving(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [content, cvTitle]);

  const handlePrint = async () => {
    const cvElement = document.getElementById('cv-print-area');
    if (!cvElement) return;

    setIsGenerating(true);

    // Obtener todas las reglas CSS cargadas en el documento
    let styles = '';
    const styleSheets = document.styleSheets;
    try {
      for (let i = 0; i < styleSheets.length; i++) {
        const sheet = styleSheets[i];
        const rules = sheet.cssRules || sheet.rules;
        if (rules) {
          for (let j = 0; j < rules.length; j++) {
            styles += rules[j].cssText + '\n';
          }
        }
      }
    } catch (e) {
      console.warn("No se pudo leer algunas reglas de estilo: ", e);
    }

    // Construir el documento HTML completo e independiente
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>${styles}</style>
          <style>
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              color: black !important;
            }
            #cv-print-area {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              width: 100% !important;
              min-height: 0 !important;
            }
          </style>
        </head>
        <body>
          <div id="cv-print-area">
            ${cvElement.innerHTML}
          </div>
        </body>
      </html>
    `;

    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html: fullHtml })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setToast({ message: errorData.error || 'Error al generar el PDF', type: 'error' });
        return;
      }

      // Convertir respuesta a Blob y forzar descarga
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cvTitle.replace(/\s+/g, '_') || 'curriculum'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err: any) {
      setToast({ message: 'Error al conectar con el servidor: ' + err.message, type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 print:h-auto print:w-auto print:overflow-visible">
      {/* Editor Header */}
      <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-4 dark:border-zinc-800 dark:bg-zinc-950 print:hidden shrink-0">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-bold text-lg dark:bg-white dark:text-black hover:bg-zinc-800 transition-colors">
            CF
          </a>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={cvTitle} 
              onChange={(e) => setCvTitle(e.target.value)}
              className="text-sm font-bold bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-black focus:outline-none px-1 py-0.5 transition-colors dark:focus:border-white"
            />
            <span className="text-[10px] text-zinc-400 font-medium">
              {isSaving ? 'Guardando...' : 'Cambios guardados'}
            </span>
          </div>
        </div>

        {/* Acciones del Editor */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border-r border-zinc-200 pr-3 dark:border-zinc-800">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={undo} 
              disabled={history.past.length === 0}
              className="h-8 w-8 p-0"
              title="Deshacer (Ctrl+Z)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
              </svg>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={redo} 
              disabled={history.future.length === 0}
              className="h-8 w-8 p-0"
              title="Rehacer (Ctrl+Y)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z" />
              </svg>
            </Button>
          </div>

          <Button 
            onClick={handlePrint}
            disabled={isGenerating}
            className="h-9 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 flex items-center gap-2 active:scale-98 transition-all"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-black" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Exportar PDF</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Panel de Contenido Principal */}
      <div className="flex-1 flex overflow-hidden print:overflow-visible print:block relative">
        <EditPanel className={activeTab === 'edit' ? 'flex' : 'hidden lg:flex'} />
        <PreviewPanel className={activeTab === 'preview' ? 'flex' : 'hidden lg:flex'} />
      </div>

      {/* Floating Mobile Tab Switcher */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg p-1 flex gap-1 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'edit'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
          }`}
        >
          Editar Datos
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
          }`}
        >
          Vista Previa
        </button>
      </div>

      {/* React Toast Overlay */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-55 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm font-semibold transition-all duration-300 pointer-events-auto ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50'
            : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50'
        }`}>
          {toast.type === 'success' ? (
            <svg className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
