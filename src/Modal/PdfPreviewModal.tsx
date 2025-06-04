import React from 'react';

interface PdfPreviewModalProps {
  open: boolean;
  url: string;
  onClose: () => void;
}

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ open, url, onClose }) => {
  if (!open) return null;

  return (
    <div className="pdf-modal-overlay">
      <div className="pdf-modal-content">
        <button onClick={onClose} className="close-btn">❌ Cerrar</button>
        <iframe
  src={url}
  width="100%"
  height="600px"
  title="Vista previa del PDF"
  style={{ border: 'none' }}
/>

      </div>
    </div>
  );
};

export default PdfPreviewModal;
