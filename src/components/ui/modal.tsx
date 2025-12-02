import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

type ModalProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          {title ? <h3 className="text-sm font-semibold text-gray-900">{title}</h3> : <span />}
          <Button variant="ghost" onClick={onClose} aria-label="Close modal">
            ×
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
