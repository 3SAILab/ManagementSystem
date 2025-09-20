import { X } from 'lucide-react';

const ModalCloseButton = ({ onClose }) => {
  return (
    <button
      id="modal-close"
      className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
      onClick={onClose}
      aria-label="关闭模态框"
    >
      <X className="w-5 h-5" />
    </button>
  );
};

export default ModalCloseButton;