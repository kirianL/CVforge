import React from 'react';
import { EditPanel } from './EditPanel';
import { PreviewPanel } from './PreviewPanel';
import { useCVStore } from '../../lib/store';
import { Button } from '../ui/button';
import { analyzeCV } from '../../lib/ats';
import { AtsAnalyzer } from './AtsAnalyzer';

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
  const [isAtsOpen, setIsAtsOpen] = React.useState(false);
  const isFirstLoad = React.useRef(true);

  const { score, label, bgColor, textColor } = analyzeCV(content);

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
      <header className="h-14 border-b border-zinc-200 bg-white/70 backdrop-blur-md flex items-center justify-between px-4 dark:border-zinc-800/30 dark:bg-zinc-950/70 print:hidden shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="flex items-center gap-2.5 no-underline cursor-pointer select-none" title="Volver al Dashboard">
            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-black text-white font-extrabold text-[15px] dark:bg-white dark:text-black shrink-0">
              CF
            </div>
            <span className="text-[16px] font-bold tracking-tight text-zinc-900 dark:text-white hidden sm:inline">CV<span className="text-zinc-450">Forge</span></span>
          </a>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={cvTitle} 
              onChange={(e) => setCvTitle(e.target.value)}
              className="text-sm font-bold bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-black focus:outline-none px-1 py-0.5 transition-colors dark:focus:border-white max-w-[100px] sm:max-w-[180px]"
            />
            <span className="hidden sm:inline text-[10px] text-zinc-400 font-medium mr-2">
              {isSaving ? 'Guardando...' : 'Cambios guardados'}
            </span>
            <button 
              onClick={() => setIsAtsOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold shadow-sm transition-all active:scale-95 hover:scale-102 cursor-pointer ${bgColor} ${textColor} border-zinc-200 dark:border-zinc-800/65`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              <span>ATS: {score}%</span>
            </button>
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
              className="h-8 w-8 p-0 flex items-center justify-center cursor-pointer"
              title="Deshacer (Ctrl+Z)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-zinc-550 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
              </svg>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={redo} 
              disabled={history.future.length === 0}
              className="h-8 w-8 p-0 flex items-center justify-center cursor-pointer"
              title="Rehacer (Ctrl+Y)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-zinc-550 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                <path d="M21 7v6h-6" />
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
              </svg>
            </Button>
          </div>

          <Button 
            onClick={handlePrint}
            disabled={isGenerating}
            className="h-9 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 flex items-center gap-2 active:scale-98 transition-all px-2.5 sm:px-4 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white dark:text-black" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">Generando...</span>
              </>
            ) : (
              <>
                <svg viewBox="1267 43 34 34" className="h-4 w-4 text-white dark:text-zinc-900 group-hover:text-zinc-200 dark:group-hover:text-black transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path opacity="0.12" d="M1269 75H1299V65H1269V75Z" fill="currentColor"/>
                  <path d="M1299 65V67C1299 69.8003 1299 71.2004 1298.46 72.27C1297.98 73.2108 1297.21 73.9757 1296.27 74.455C1295.2 75 1293.8 75 1291 75H1277C1274.2 75 1272.8 75 1271.73 74.455C1270.79 73.9757 1270.02 73.2108 1269.54 72.27C1269 71.2004 1269 69.8003 1269 67V65M1275.67 56.6667L1284 65L1292.33 56.6667M1284 65V45" />
                </svg>
                <span className="hidden sm:inline">Exportar PDF</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Panel de Contenido Principal */}
      <div className="flex-1 overflow-hidden print:overflow-visible print:block relative">
        <div className={`flex h-full w-[200%] lg:w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] print:block print:w-auto print:transform-none ${
          activeTab === 'edit' ? 'translate-x-0' : '-translate-x-1/2 lg:translate-x-0'
        }`}>
          <EditPanel className="w-1/2 lg:w-[480px] xl:w-[540px] shrink-0" />
          <PreviewPanel className="w-1/2 lg:flex-1 shrink-0 lg:w-auto" />
        </div>
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

      {/* Custom ATS Suggestions Modal Overlay */}
      {isAtsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto transition-all duration-300">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 dark:bg-zinc-900 dark:border-zinc-800 m-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3 mb-4 dark:border-zinc-800/60">
              <h3 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Sugerencias de Optimización ATS</h3>
              <button 
                onClick={() => setIsAtsOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 text-sm font-bold p-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1">
              <AtsAnalyzer />
            </div>

            <div className="mt-6 flex items-center justify-end">
              <Button 
                onClick={() => setIsAtsOpen(false)}
                className="h-8 bg-black text-white hover:bg-zinc-850 dark:bg-white dark:text-black dark:hover:bg-zinc-100 px-4 font-bold text-xs cursor-pointer rounded-lg uppercase tracking-wider transition-colors"
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}

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
