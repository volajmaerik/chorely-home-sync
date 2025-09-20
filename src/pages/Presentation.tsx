import { useEffect } from 'react';

const Presentation = () => {
  useEffect(() => {
    // Redirect to the static HTML presentation
    window.location.href = '/presentation.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-slate-600">Loading presentation...</p>
      </div>
    </div>
  );
};

export default Presentation;