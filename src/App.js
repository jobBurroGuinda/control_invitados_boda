import React, { useEffect, useState, useCallback } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { Toaster, toast } from 'react-hot-toast';
import AddGuestModal from './components/AddGuestModal';
import ShareModal from './components/ShareModal';
import GuestCard from './components/GuestCard';
import './App.css';

/**
 * @fileoverview Componente principal del panel de control de invitaciones.
 * @author Job Adolfo Salinas Hernández
 */

/** Nombre de la colección de Firestore que almacena las invitaciones. @type {string} */
const COLLECTION = 'invitaciones';

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
 * Tarjeta de estadística que muestra un ícono, valor y etiqueta.
 *
 * @component
 * @param {Object} props
 * @param {string} props.label - Texto descriptivo de la estadística.
 * @param {number|string} props.value - Valor numérico a mostrar.
 * @param {string} props.icon - Emoji o ícono representativo.
 * @returns {JSX.Element}
 */
function StatBadge({ label, value, icon }) {
  return (
    <div className="col-6 col-md-3 mb-3">
      <div className="stat-badge">
        <div className="stat-badge__icon">{icon}</div>
        <div className="stat-badge__value">{value}</div>
        <div className="stat-badge__label">{label}</div>
      </div>
    </div>
  );
}

/**
 * Opciones disponibles para el filtro de estado de confirmación.
 * @type {Array<{value: string, label: string}>}
 */
const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'pending', label: 'Pendientes' },
];

/**
 * Componente principal del panel de administración de invitaciones.
 * Permite listar, buscar, filtrar, agregar, confirmar y eliminar invitados.
 * Se sincroniza en tiempo real con Firestore.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function App() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [shareGuest, setShareGuest] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy('fecha_registro', 'desc'));
    const unsub = onSnapshot(q,
      (snap) => {
        setGuests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error('Error al cargar las invitaciones');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleAddSuccess = useCallback((newGuest) => {
    setShowAddModal(false);
    setShareGuest(newGuest);
  }, []);

  const handleDelete = useCallback(async (guest) => {
    const result = await Swal.fire({
      title: '¿Eliminar invitación?',
      html: `<span style="font-size:0.95rem">Se eliminará la invitación de <strong>${guest.name}</strong>.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;
    try {
      await deleteDoc(doc(db, COLLECTION, guest.id));
      Swal.fire({ title: 'Eliminada', text: `La invitación de ${guest.name} fue eliminada.`, icon: 'success', timer: 2000, showConfirmButton: false, timerProgressBar: true });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo eliminar. Intenta de nuevo.', 'error');
    }
  }, []);

  const handleConfirm = useCallback(async (guest) => {
    const result = await Swal.fire({
      title: '¿Confirmar asistencia?',
      html: `<span style="font-size:0.95rem">Se marcará a <strong>${guest.name}</strong> como confirmado.</span>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#9ca3af',
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;
    try {
      await updateDoc(doc(db, COLLECTION, guest.id), {
        is_confirmado: true,
        fecha_confirmacion: nowGMT6(),
      });
      Swal.fire({ title: '¡Confirmado!', text: `${guest.name} fue marcado como confirmado.`, icon: 'success', timer: 2000, showConfirmButton: false, timerProgressBar: true });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo confirmar. Intenta de nuevo.', 'error');
    }
  }, []);

  const filtered = guests.filter(g => {
    const matchSearch = g.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'confirmed' ? g.is_confirmado :
      !g.is_confirmado;
    return matchSearch && matchFilter;
  });

  const totalConfirmados = guests.filter(g => g.is_confirmado).length;
  const totalAsistentes = guests.reduce((acc, g) => acc + (parseInt(g.asistentes) || 0), 0);
  const totalAsistentesConfirmados = guests.filter(g => g.is_confirmado).reduce((acc, g) => acc + (parseInt(g.asistentes) || 0), 0);

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{ style: { zIndex: 9999 } }} />

      {showAddModal && (
        <AddGuestModal onClose={() => setShowAddModal(false)} onSuccess={handleAddSuccess} />
      )}
      {shareGuest && (
        <ShareModal guest={shareGuest} onClose={() => setShareGuest(null)} />
      )}

      <div className="app-header">
        <h1>Misael &amp; Tiatira</h1>
        <p>Control de Invitaciones</p>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px' }}>

        <div className="row mb-2">
          <StatBadge icon="💌" label="Invitaciones" value={guests.length} />
          <StatBadge icon="✅" label="Confirmados" value={totalConfirmados} />
          <StatBadge icon="👥" label="Total asistentes" value={totalAsistentes} />
          <StatBadge icon="🎉" label="Asistentes conf." value={totalAsistentesConfirmados} />
        </div>

        {/* Buscador y filtros */}
        <div className="row mb-4">
          <div className="col-12 col-md-8 offset-md-2">
            <div className="search-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-tabs">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`filter-tab ${filter === opt.value ? 'filter-tab--active' : ''}`}
                  onClick={() => setFilter(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="state-empty">
            <div className="state-empty__icon">⏳</div>
            <p>Cargando invitaciones...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="state-empty">
            <div className="state-empty__icon">🔍</div>
            <p>{search || filter !== 'all' ? 'Sin resultados para esa búsqueda.' : 'Aún no hay invitaciones registradas.'}</p>
          </div>
        ) : (
          <>
            <p className="results-count">
              Mostrando {filtered.length} de {guests.length} invitaciones
            </p>
            <div className="row">
              {filtered.map((g, i) => (
                <GuestCard key={g.id} guest={g} index={i} onDelete={handleDelete} onConfirm={handleConfirm} />
              ))}
            </div>
          </>
        )}
      </div>

      <button className="fab" onClick={() => setShowAddModal(true)} title="Nueva invitación">
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
}
