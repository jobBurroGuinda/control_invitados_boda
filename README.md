# 📋 Panel de Control de Invitados — Misael & Tiatira

Aplicación web de administración interna para gestionar la lista de invitados a la boda de Misael y Tiatira. Permite registrar invitados, generar sus enlaces personalizados, confirmar asistencias manualmente y compartir las invitaciones vía WhatsApp o portapapeles.

## Autor

**Job Adolfo Salinas Hernández**

---

## Características

- Listado en tiempo real de todos los invitados (sincronizado con Firestore)
- Registro de nuevos invitados con generación automática de UUID único
- Edición de nombre, número de asistentes y mensaje personalizado de los novios
- Confirmación manual de asistencia desde el panel
- Eliminación de invitaciones con confirmación vía SweetAlert2
- Búsqueda por nombre y filtrado por estado (todos / confirmados / pendientes)
- Tarjetas de estadísticas: total de invitaciones, confirmados y asistentes
- Copia y compartición del enlace personalizado de cada invitado
- Modal de compartir con acceso directo a WhatsApp tras registrar un invitado
- Sanitización de entradas para prevenir XSS

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Framework de UI |
| Firebase Firestore | 12 | Base de datos en tiempo real |
| SweetAlert2 | 11 | Diálogos de confirmación |
| react-hot-toast | 2 | Notificaciones rápidas |
| uuid | 14 | Generación de UUIDs únicos |
| Create React App | 5 | Configuración del proyecto |

## Estructura del proyecto

```
src/
├── components/
│   ├── AddGuestModal.js      # Modal para registrar un nuevo invitado
│   ├── EditGuestModal.js     # Modal para editar datos del invitado
│   ├── EditMessageModal.js   # Modal para editar solo el mensaje de los novios
│   ├── GuestCard.js          # Tarjeta de invitado con acciones
│   └── ShareModal.js         # Modal para compartir el enlace tras registrar
├── utils/
│   └── sanitize.js           # Funciones de sanitización de texto
├── App.js                    # Componente principal con listado y filtros
├── firebase.js               # Inicialización de Firebase
└── index.js                  # Punto de entrada
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
REACT_APP_FIREBASE_API_KEY=<api_key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<auth_domain>
REACT_APP_FIREBASE_PROJECT_ID=<project_id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<storage_bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<messaging_sender_id>
REACT_APP_FIREBASE_APP_ID=<app_id>
```

## Scripts disponibles

```bash
# Inicia el servidor de desarrollo
npm start

# Genera el build de producción
npm run build

# Ejecuta las pruebas
npm test
```

## Colección de Firestore

Todos los documentos se almacenan en la colección `invitaciones`. Estructura de cada documento:

| Campo | Tipo | Descripción |
|---|---|---|
| `uuid` | string | Identificador único de la invitación |
| `name` | string | Nombre del invitado |
| `asistentes` | number | Número de personas incluidas |
| `mensaje_novios` | string | Mensaje personalizado de los novios |
| `mensaje_de_invitado` | string | Mensaje escrito por el invitado al confirmar |
| `is_confirmado` | boolean | Estado de confirmación de asistencia |
| `fecha_registro` | timestamp | Fecha de creación (GMT-6) |
| `fecha_confirmacion` | timestamp \| null | Fecha en que confirmó (GMT-6) |

## Despliegue

El proyecto está configurado para desplegarse en **Firebase Hosting**. Para publicar:

```bash
npm run build
firebase deploy
```
