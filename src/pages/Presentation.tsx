import { useEffect } from 'react';

const Presentation = () => {
  useEffect(() => {
    // ensure title is appropriate when showing the embedded presentation
    const prev = document.title;
    document.title = 'Presentation — Chorely';
    return () => { document.title = prev; };
  }, []);

  return (
    // Full-viewport iframe to render the static presentation HTML inside the app
    <div className="fixed inset-0 bg-black">
      <iframe
        title="Chorely Presentation"
        src="/presentation.html"
        className="w-full h-full"
        style={{ border: 'none' }}
        allowFullScreen
      />
    </div>
  );
};

export default Presentation;
