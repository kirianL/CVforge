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
      <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-4 dark:border-zinc-800 dark:bg-zinc-950 print:hidden shrink-0">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all active:scale-95" title="Volver al Dashboard">
            <svg viewBox="52 41 34 36" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path opacity="0.12" d="M54 57.6084C54 56.6512 54 56.1725 54.1234 55.7318C54.2327 55.3413 54.4123 54.9741 54.6534 54.6481C54.9256 54.2801 55.3034 53.9862 56.059 53.3985L67.3628 44.6067C67.9484 44.1512 68.2411 43.9235 68.5644 43.836C68.8497 43.7588 69.1503 43.7588 69.4356 43.836C69.7589 43.9235 70.0516 44.1512 70.6372 44.6067L81.941 53.3985C82.6966 53.9862 83.0744 54.2801 83.3466 54.6481C83.5877 54.9741 83.7673 55.3413 83.8766 55.7318C84 56.1725 84 56.6512 84 57.6084V69.6666C84 71.5335 84 72.4669 83.6367 73.1799C83.3171 73.8071 82.8072 74.3171 82.18 74.6367C81.4669 75 80.5335 75 78.6667 75H59.3333C57.4665 75 56.5331 75 55.82 74.6367C55.1928 74.3171 54.6829 73.8071 54.3633 73.1799C54 72.4669 54 71.5335 54 69.6666V57.6084Z" fill="currentColor"/>
              <path d="M62.5434 63.3333C63.2834 66.2087 65.8936 68.3333 69 68.3333C72.1064 68.3333 74.7166 66.2087 75.4566 63.3333M67.3628 44.6067L56.059 53.3985C55.3034 53.9862 54.9256 54.2801 54.6534 54.6481C54.4123 54.9741 54.2327 55.3413 54.1234 55.7318C54 56.1725 54 56.6512 54 57.6084V69.6666C54 71.5335 54 72.4669 54.3633 73.1799C54.6829 73.8071 55.82 74.6367C56.5331 75 57.4665 75 59.3333 75H78.6667C80.5335 75 81.4669 75 82.18 74.6367C82.8072 74.3171 83.3171 73.8071 83.6367 73.1799C84 72.4669 84 71.5335 84 69.6666V57.6084C84 56.6512 84 56.1725 83.8766 55.7318C83.7673 55.3413 83.5877 54.9741 83.3466 54.6481C83.0744 54.2801 82.6966 53.9862 81.941 53.3985L70.6372 44.6067C70.0516 44.1512 69.7589 43.9235 69.4356 43.836C69.1503 43.7588 68.8497 43.7588 68.5644 43.836C68.2411 43.9235 67.9484 44.1512 67.3628 44.6067Z" />
            </svg>
          </a>
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
              className="h-8 w-8 p-0 flex items-center justify-center"
              title="Deshacer (Ctrl+Z)"
            >
              <svg viewBox="212 41 37 37" className="h-4 w-4 text-zinc-550 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path opacity="0.12" d="M237.667 53.3333V61.6667C237.667 62.9927 238.193 64.2645 239.131 65.2022C240.069 66.1399 241.341 66.6667 242.667 66.6667C243.993 66.6667 245.264 66.1399 246.202 65.2022C247.14 64.2645 247.667 62.9927 247.667 61.6667V60C247.666 56.2384 246.394 52.5874 244.055 49.6409C241.717 46.6943 238.451 44.6254 234.788 43.7705C231.124 42.9156 227.28 43.3251 223.879 44.9323C220.478 46.5395 217.721 49.2499 216.055 52.6229C214.39 55.9958 213.915 59.8329 214.707 63.5102C215.499 67.1875 217.512 70.4887 220.418 72.8771C223.324 75.2655 226.952 76.6006 230.713 76.6652C234.474 76.7299 238.147 75.5204 241.133 73.2333" fill="currentColor"/>
                <path d="M237.667 60C237.667 63.6819 234.682 66.6667 231 66.6667C227.318 66.6667 224.333 63.6819 224.333 60C224.333 56.3181 227.318 53.3333 231 53.3333C234.682 53.3333 237.667 56.3181 237.667 60Z" />
              </svg>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={redo} 
              disabled={history.future.length === 0}
              className="h-8 w-8 p-0 flex items-center justify-center"
              title="Rehacer (Ctrl+Y)"
            >
              <svg viewBox="860 41 37 37" className="h-4 w-4 text-zinc-550 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path opacity="0.12" d="M879 76.6667C888.205 76.6667 895.667 69.2047 895.667 60C895.667 50.7953 888.205 43.3333 879 43.3333C869.795 43.3333 862.333 50.7953 862.333 60C862.333 69.2047 869.795 76.6667 879 76.6667Z" fill="currentColor"/>
                <path d="M872.333 60L879 53.3333L885.667 60M879 53.3333V68.6667C879 70.9845 879 72.1434 879.917 73.441C880.527 74.3031 882.282 75.3672 883.329 75.509C884.903 75.7223 885.501 75.4104 886.698 74.7864C892.028 72.0059 895.667 66.4279 895.667 60C895.667 50.7953 888.205 43.3333 879 43.3333C869.795 43.3333 862.333 50.7953 862.333 60C862.333 66.169 865.685 71.5552 870.667 74.437" />
              </svg>
            </Button>
          </div>

          <Button 
            onClick={handlePrint}
            disabled={isGenerating}
            className="h-9 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 flex items-center gap-2 active:scale-98 transition-all px-2.5 sm:px-4"
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
