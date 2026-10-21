/**
 * @fileoverview Modal para editar los datos de un invitado existente.
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
 * Modal para editar el nombre, número de asistentes y mensaje de un invitado.
 * Actualiza el documento correspondiente en Firestore al guardar.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.guest - Datos actuales del invitado a editar.
 * @param {string} props.guest.id - ID del documento en Firestore.
 * @param {string} props.guest.name - Nombre del invitado.
 * @param {number} props.guest.asistentes - Número de asistentes.
 * @param {string} props.guest.mensaje_novios - Mensaje de los novios para el invitado.
 * @param {Function} props.onClose - Callback para cerrar el modal.
 * @returns {JSX.Element}
 */
export default function EditGuestModal({ guest, onClose }) {
  const [form, setForm] = useState({
    name: guest.name || '',
    asistentes: guest.asistentes || '',
    mensaje_novios: guest.mensaje_novios || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'asistentes' && !/^\d*$/.test(value)) return;
    setForm(prev => ({ ...prev, [name]: name === 'asistentes' ? value : sanitizeLive(value) }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const asistentesNum = parseInt(form.asistentes);
    const newErrors = {
      name: !form.name.trim(),
      asistentes: !form.asistentes || isNaN(asistentesNum) || asistentesNum < 1,
      mensaje_novios: !form.mensaje_novios.trim(),
    };
    if (newErrors.name || newErrors.asistentes || newErrors.mensaje_novios) {
      setErrors(newErrors);
      if (newErrors.name) toast.error('Por favor ingresa el nombre del invitado.');
      else if (newErrors.asistentes) toast.error('El número de asistentes debe ser mayor a 0.');
      else toast.error('Por favor escribe un mensaje para el invitado.');
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTION, guest.id), {
        name: sanitize(form.name),
        asistentes: asistentesNum,
        mensaje_novios: sanitize(form.mensaje_novios),
      });
      Swal.fire({ title: '¡Actualizado!', text: 'La invitación fue actualizada correctamente.', icon: 'success', timer: 2000, showConfirmButton: false, timerProgressBar: true });
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
          <h2 className="modal-sheet__title">Editar invitación</h2>
          <button className="modal-sheet__close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-sheet__body">
          <div className="modal-field">
            <label>Nombre completo</label>
            <input
              name="name"
              type="text"
              placeholder="Nombre del invitado"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'input--error' : ''}
              autoFocus
            />
          </div>
          <div className="modal-field">
            <label>Número de asistentes</label>
            <input
              name="asistentes"
              type="text"
              inputMode="numeric"
              placeholder="Ej. 2"
              value={form.asistentes}
              onChange={handleChange}
              className={errors.asistentes ? 'input--error' : ''}
            />
          </div>
          <div className="modal-field">
            <div className="modal-field__label-row">
              <label>Mensaje de los novios</label>
              <button
                type="button"
                className="modal-field__clear-btn"
                onClick={() => { setForm(prev => ({ ...prev, mensaje_novios: '' })); setErrors(prev => ({ ...prev, mensaje_novios: false })); }}
              >
                <i className="fas fa-trash-alt"></i> Limpiar
              </button>
            </div>
            <textarea
              name="mensaje_novios"
              rows={6}
              value={form.mensaje_novios}
              onChange={handleChange}
              placeholder="Escribe un mensaje para el invitado..."
              className={errors.mensaje_novios ? 'input--error' : ''}
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
