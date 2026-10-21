/**
 * @fileoverview Modal para registrar un nuevo invitado.
 * @author Job Adolfo Salinas Hernández
 */
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { sanitize, sanitizeLive } from '../utils/sanitize';

/** Nombre de la colección de Firestore que almacena las invitaciones. @type {string} */
const COLLECTION = 'invitaciones';

/**
 * Mensaje predeterminado de los novios para nuevas invitaciones.
 * Se usa como valor inicial del campo `mensaje_novios` en el formulario.
 * @type {string}
 */
const MENSAJE_DEFAULT =
  `¡Nos da mucho gusto invitarte a compartir este día tan especial con nosotros!
Tu presencia hará que nuestra boda sea aún más memorable.

Con cariño,
Misael & Tiatira`;

/**
 * Retorna la fecha y hora actual ajustada a GMT-6 (Horario Central de México).
 * @returns {Date}
 */
function nowGMT6() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc - 6 * 3600000);
}

/**
 * Modal para agregar un nuevo invitado a la lista.
 * Genera un UUID único, valida los campos y guarda el documento en Firestore.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onClose - Callback para cerrar el modal.
 * @param {Function} props.onSuccess - Callback ejecutado al guardar exitosamente, recibe los datos del nuevo invitado.
 * @returns {JSX.Element}
 */
export default function AddGuestModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', asistentes: '', mensaje_novios: MENSAJE_DEFAULT });
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
      const uuid = uuidv4();
      const docData = {
        uuid,
        name: sanitize(form.name),
        asistentes: asistentesNum,
        mensaje_novios: sanitize(form.mensaje_novios),
        is_confirmado: false,
        mensaje_de_invitado: '',
        fecha_registro: nowGMT6(),
        fecha_confirmacion: null,
      };
      await addDoc(collection(db, COLLECTION), docData);
      onSuccess({ ...docData });
    } catch (err) {
      console.error(err);
      toast.error('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-sheet__header">
          <h2 className="modal-sheet__title">Nueva invitación</h2>
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
                title="Borrar mensaje"
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
            {saving ? 'Guardando...' : 'Registrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
