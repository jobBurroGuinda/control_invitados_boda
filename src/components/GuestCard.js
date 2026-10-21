/**
 * @fileoverview Tarjeta de invitado para el panel de administración.
 * @author Job Adolfo Salinas Hernández
 */
import React, { useState } from 'react';
import EditGuestModal from './EditGuestModal';

/** URL base de la aplicación de invitaciones. @type {string} */
const BASE_URL = 'https://missael-y-tiatira.web.app';

/**
 * Tarjeta que muestra la información de un invitado: nombre, estado de confirmación,
 * número de asistentes, mensaje del invitado, fechas y acciones (copiar enlace, compartir,
 * editar, confirmar, eliminar).
 *
 * @component
 * @param {Object} props
 * @param {Object} props.guest - Datos del invitado.
 * @param {string} props.guest.id - ID del documento en Firestore.
 * @param {string} props.guest.uuid - UUID único de la invitación.
 * @param {string} props.guest.name - Nombre del invitado.
 * @param {boolean} props.guest.is_confirmado - Indica si el invitado confirmó asistencia.
 * @param {number} props.guest.asistentes - Número de asistentes.
 * @param {string} [props.guest.mensaje_de_invitado] - Mensaje escrito por el invitado al confirmar.
 * @param {Object} [props.guest.fecha_registro] - Timestamp de Firestore con la fecha de registro.
 * @param {Object} [props.guest.fecha_confirmacion] - Timestamp de Firestore con la fecha de confirmación.
 * @param {number} props.index - Índice de la tarjeta en la lista (para mostrar el número).
 * @param {Function} props.onDelete - Callback para eliminar el invitado.
 * @param {Function} props.onConfirm - Callback para confirmar manualmente la asistencia.
 * @returns {JSX.Element}
 */
export default function GuestCard({ guest, index, onDelete, onConfirm }) {
  const [showEdit, setShowEdit] = useState(false);
  const [copied, setCopied] = useState(false);

  const link = `${BASE_URL}/${guest.uuid}/invitacion`;

  const fecha = guest.fecha_registro?.toDate
    ? guest.fecha_registro.toDate().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  const fechaConfirmacion = guest.fecha_confirmacion?.toDate
    ? guest.fecha_confirmacion.toDate().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Invitación de boda', text: `¡Hola ${guest.name}! Te compartimos tu invitación.`, url: link });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`¡Hola ${guest.name}! Te compartimos tu invitación: ${link}`)}`, '_blank');
    }
  };

  return (
    <>
      {showEdit && <EditGuestModal guest={guest} onClose={() => setShowEdit(false)} />}

      <div className={`col-12 col-sm-6 col-lg-4 mb-4`}>
        <div className={`guest-card ${guest.is_confirmado ? 'guest-card--confirmed' : ''}`}>

          {/* Header de la tarjeta */}
          <div className="guest-card__actions">
            <span className="guest-card__index">#{index + 1}</span>
            <div className="guest-card__action-btns">
              {!guest.is_confirmado && (
                <button onClick={() => onConfirm(guest)} title="Confirmar asistencia" className="guest-card__action-btn guest-card__action-btn--confirm">
                  <i className="fas fa-check"></i>
                </button>
              )}
              <button onClick={() => setShowEdit(true)} title="Editar invitación" className="guest-card__action-btn guest-card__action-btn--edit">
                <i className="fas fa-pencil-alt"></i>
              </button>
              <button onClick={() => onDelete(guest)} title="Eliminar invitación" className="guest-card__action-btn guest-card__action-btn--delete">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Avatar y nombre */}
          <div className="guest-card__avatar">
            {guest.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <h5 className="guest-card__name">{guest.name || '—'}</h5>

          {/* Estado y asistentes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div className={`guest-card__status ${guest.is_confirmado ? 'guest-card__status--confirmed' : 'guest-card__status--pending'}`}>
              <i className={`fas ${guest.is_confirmado ? 'fa-check-circle' : 'fa-clock'}`}></i>
              {guest.is_confirmado ? 'Confirmado' : 'Pendiente'}
            </div>
            {guest.asistentes && (
              <div className="guest-card__status guest-card__status--guests">
                <i className="fas fa-users"></i>
                {guest.asistentes} {guest.asistentes === 1 ? 'asistente' : 'asistentes'}
              </div>
            )}
          </div>

          {/* Mensaje del invitado (solo si confirmó) */}
          {guest.is_confirmado && guest.mensaje_de_invitado && (
            <div className="guest-card__guest-message">
              <i className="fas fa-comment-dots"></i>
              <p style={{ whiteSpace: 'pre-line' }}>"{guest.mensaje_de_invitado}"</p>
            </div>
          )}

          {/* Fechas */}
          <div className="guest-card__dates">
            <div className="guest-card__date">
              <i className="fas fa-calendar-plus"></i>
              Registro: {fecha}
            </div>
            {fechaConfirmacion && (
              <div className="guest-card__date guest-card__date--confirmed">
                <i className="fas fa-calendar-check"></i>
                Confirmó: {fechaConfirmacion}
              </div>
            )}
          </div>

          {/* Acciones de enlace */}
          <div className="guest-card__link-actions">
            <button className={`guest-card__link-btn ${copied ? 'guest-card__link-btn--copied' : ''}`} onClick={handleCopy} title="Copiar enlace">
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button className="guest-card__link-btn guest-card__link-btn--share" onClick={handleShare} title="Compartir enlace">
              <i className="fas fa-share-alt"></i>
              Compartir
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
