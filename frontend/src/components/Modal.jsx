import { useEffect } from 'react';

function Modal({ isOpen, onClose, title, children }) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg mx-4 glass-card p-6 animate-fade-in-up border border-dark-600/50 shadow-2xl shadow-primary-500/5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-dark-100">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-800/50 text-dark-400 hover:text-dark-100 hover:bg-dark-700/50 transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
