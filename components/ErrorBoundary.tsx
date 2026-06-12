import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl border border-gray-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-3xl text-red-400"></i>
            </div>
            <h2 className="text-lg font-black text-gray-800 mb-2">خطایی رخ داد</h2>
            <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
              متأفانه مشکلی پیش آمده. لطفاً صفحه را رفرش کنید یا دوباره تلاش کنید.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              رفرش صفحه
            </button>
            <details className="mt-4 text-left">
              <summary className="text-[10px] text-gray-400 font-bold cursor-pointer">جزئیات خطا</summary>
              <pre className="mt-2 text-[9px] text-red-500 bg-red-50 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
                {this.state.error?.message}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
