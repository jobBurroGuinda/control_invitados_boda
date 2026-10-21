/**
 * @fileoverview Modal para editar únicamente el mensaje de los novios de un invitado.
 * @author Job Adolfo Salinas Hernández
 */
import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';
import { sanitize, sanitizeLive } from '../utils/sanitize';

/** Nombre de la colección de Firestore que almacena las invitaciones. @type {string} */
const COLLECTION = 'invitaciones';

/**
 * Modal para editar el mensaje personalizado de los novios hacia un invitado.
 * Actualiza únicamente el campo `mensaje_novios` en Firestore.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.guest - Datos del invitado.
 * @param {string} props.guest.id - ID del documento en Firestore.
 * @param {string} props.guest.name - Nombre del invitado (mostrado en el modal).
 * @param {string} props.guest.mensaje_novios - Mensaje actual de los novios.
 * @param {Function} props.onClose - Callback para cerrar el modal.
 * @returns {JSX.Element}
 */
export default function EditMessageModal({ guest, onClose }) {
  const [mensaje, setMensaje] = useState(guest.mensaje_novios || '');
  const [hasError, setHasError] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) {
      setHasError(true);
      return toast.error('Por favor escribe un mensaje para el invitado.');
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTION, guest.id), { mensaje_novios: sanitize(mensaje) });
      Swal.fire({ title: '¡Actualizado!', text: 'El mensaje fue guardado correctamente.', icon: 'success', timer: 2000, showConfirmButton: false, timerProgressBar: true });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo actualizar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-sheet__header">
          <h2 className="modal-sheet__title">Editar mensaje</h2>
          <button className="modal-sheet__close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-sheet__body">
          <p className="modal-subtitle">Mensaje de los novios para <strong>{guest.name}</strong></p>
          <div className="modal-field">
            <div className="modal-field__label-row">
              <label>Mensaje</label>
              <button
                type="button"
                className="modal-field__clear-btn"
                onClick={() => { setMensaje(''); setHasError(false); }}
                title="Borrar mensaje"
              >
                <i className="fas fa-trash-alt"></i> Limpiar
              </button>
            </div>
            <textarea
              rows={6}
              value={mensaje}
              onChange={e => { setMensaje(sanitizeLive(e.target.value)); if (hasError) setHasError(false); }}
              placeholder="Escribe un mensaje para el invitado..."
              className={hasError ? 'input--error' : ''}
              autoFocus
            />
          </div>
          <button type="submit" className="modal-submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
