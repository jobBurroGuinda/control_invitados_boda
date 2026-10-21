/**
 * @fileoverview Modal para compartir el enlace de invitación recién creado.
 * @author Job Adolfo Salinas Hernández
 */
import React from 'react';

/**
 * Modal que se muestra tras registrar un nuevo invitado.
 * Permite copiar o compartir el enlace personalizado de la invitación.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.guest - Datos del invitado recién registrado.
 * @param {string} props.guest.uuid - UUID único de la invitación.
 * @param {string} props.guest.name - Nombre del invitado.
 * @param {Function} props.onClose - Callback para cerrar el modal.
 * @returns {JSX.Element}
 */
export default function ShareModal({ guest, onClose }) {
  const link = `https://missael-y-tiatira.web.app/${guest.uuid}/invitacion`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      const btn = document.getElementById('copy-btn-share');
      if (btn) { btn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!'; setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copiar enlace'; }, 2000); }
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Invitación de boda', text: `¡Estás invitado! ${guest.name}`, url: link });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`¡Hola ${guest.name}! Te compartimos tu invitación: ${link}`)}`, '_blank');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-sheet__header">
          <h2 className="modal-sheet__title">Invitación registrada</h2>
          <button className="modal-sheet__close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="modal-sheet__body">
          <div className="share-success">
            <div className="share-success__icon">🎉</div>
            <p className="share-success__text">
              La invitación de <strong>{guest.name}</strong> fue registrada exitosamente.
            </p>
          </div>

          <div className="share-link-box">
            <p className="share-link-label">Enlace de invitación</p>
            <p className="share-link-url">{link}</p>
          </div>

          <button id="copy-btn-share" className="share-action-btn" onClick={handleCopy}>
            <i className="fas fa-copy"></i> Copiar enlace
          </button>
          <button className="share-action-btn share-action-btn--whatsapp" onClick={handleShare}>
            <i className="fas fa-share-alt"></i> Compartir
          </button>
          <button className="modal-submit modal-submit--outline" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
