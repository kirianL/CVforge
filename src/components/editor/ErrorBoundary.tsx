import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside Editor ErrorBoundary:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 text-red-900 p-8 flex flex-col items-center justify-center font-mono">
          <div className="max-w-2xl w-full bg-white border border-red-200 rounded-lg shadow-lg p-6">
            <h1 className="text-xl font-bold mb-4 text-red-700">Algo salió mal en el Editor</h1>
            <p className="text-sm mb-4">El editor de currículum ha experimentado un error en el cliente.</p>
            <pre className="bg-zinc-100 p-4 rounded text-xs overflow-auto max-h-60 border border-zinc-200 text-zinc-800">
              {this.state.error?.toString()}
              {"\n\n"}
              {this.state.error?.stack}
            </pre>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-colors cursor-pointer"
              >
                Recargar página
              </button>
              <a
                href="/dashboard"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-950 text-white rounded text-sm font-semibold transition-colors flex items-center justify-center"
              >
                Volver al Panel
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
