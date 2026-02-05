---
description:
---

En cualquier tarea de frontend, ESTÁS OBLIGADO a seguir el Kio Design System:

Estilo Visual: Bento Box Design (Grillas modulares, tarjetas con bordes suaves, jerarquía clara).

Tipografía: Roboto (Google Fonts).

Paleta de Colores (Strict CSS Variables):

--kanji-color: #8a72d1 (Acento Principal)

--cruz-color: #ddd3fa (Fondos suaves/Bordes)

--kio-color: #ae93fe (Brand Primary)

--kio-color-light: rgba(174, 147, 254, 0.28) (Hover/Active states)

--text-color: #213547 (Texto principal)

--bg-color: #ffffff (Fondo tarjetas)

Animaciones: Sutiles, 'micro-interacciones' (scale 0.98 on click, fade-in suave). Nada brusco."

# KIO HEALTH: ESPECIFICACIÓN TÉCNICA

## 1. ARQUITECTURA DEL SISTEMA (TECH STACK)

- **Estrategia:** Monorepo (Nx o Turborepo sugerido).
- **Backend:** NestJS (Node.js) + TypeORM + PostgreSQL.
- **Frontend:** React (Vite) + TypeScript + TanStack Query (v5) + Zustand.
- **Estilos:** CSS Modules / Styled Components con Kio Design System (Variables).
- **Entorno:** `Strict Mode` activado.

---

## 2. DICCIONARIO DE DATOS (DATA SCHEMA)

_La IA debe usar estos nombres exactos para Entidades y Propiedades._

### 2.1 Módulo de Usuarios (Auth & Config)

- **User**
  - `id`: UUID (PK).
  - `email`: String (Unique, Indexed).
  - `passwordHash`: String.
  - `role`: Enum (`ADMIN`, `CLINICIAN`).
  - `createdAt`: Timestamp.
- **ClinicianProfile**
  - `id`: UUID (PK).
  - `userId`: UUID (FK -> User).
  - `type`: Enum (`PSYCHOLOGIST`, `NUTRITIONIST`). **(CORE SWITCH)**
  - `licenseNumber`: String.
  - `sessionDefaultDuration`: Int (minutos, default: 50).
  - `sessionDefaultPrice`: Decimal (10, 2) (default: 0.00). **(Fuente para pre-llenado)**
  - `currency`: String (ISO code, default 'USD').

### 2.2 Módulo Clínico (Core - Compartido)

- **Patient**
  - `id`: UUID (PK).
  - `clinicianId`: UUID (FK).
  - `fullName`: String (Indexed for ILIKE search).
  - `birthDate`: Date.
  - `status`: Enum (`ACTIVE`, `ARCHIVED`, `WAITLIST`).
  - `contactPhone`: String.
  - `emergencyContact`: JSON (`{ name, phone, relation }`).
- **Appointment**
  - `id`: UUID (PK).
  - `patientId`: UUID (FK).
  - `clinicianId`: UUID (FK).
  - `startTime`: Timestamp.
  - `endTime`: Timestamp.
  - `status`: Enum (`SCHEDULED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`).
  - `paymentStatus`: Enum (`PENDING`, `PAID`).
  - `price`: Decimal (10, 2). **(Fuente de Verdad Financiera)**
  - `notes`: Text (Notas administrativas breves).

### 2.3 Módulo Especializado: Psicología (Mental)

- **PsychNote** (Solo si `ClinicianProfile.type === PSYCHOLOGIST`)
  - `id`: UUID (PK).
  - `appointmentId`: UUID (FK -> Appointment).
  - `templateType`: Enum (`SOAP`, `FREE_TEXT`, `CBT`, `INITIAL_EVAL`).
  - `content`: JSONB.
    - _Schema SOAP:_ `{ s: string, o: string, a: string, p: string }`
    - _Schema FREE:_ `{ body: string }`
  - `moodRating`: Int (1-10, Nullable).
  - `privateEncryptedNotes`: Text (Opcional).

### 2.4 Módulo Especializado: Nutrición (Físico)

- **NutriRecord** (Historial de Mediciones)
  - `id`: UUID (PK).
  - `patientId`: UUID (FK).
  - `date`: Date (Default: Now).
  - `anthropometry`: JSONB (`{ weight, height, waist, hip, bicepFold, tricepFold... }`).
  - `calculations`: JSONB (`{ bmi, fatPercentage, muscleMass, bmr, hydration }`).
- **MealPlanTemplate** (Biblioteca del Nutricionista)
  - `id`: UUID (PK).
  - `clinicianId`: UUID (FK).
  - `name`: String (ej. "Keto 1500kcal").
  - `structure`: JSONB (Desglose de comidas, macros y recetas).
- **AssignedMealPlan** (Dieta Activa del Paciente)
  - `id`: UUID (PK).
  - `patientId`: UUID (FK).
  - `templateId`: UUID (FK, Nullable).
  - `customAdjustments`: JSONB (Cambios específicos para este paciente).
  - `assignedDate`: Date.
  - `isActive`: Boolean.

### 2.5 Módulo de Finanzas (Transaccional)

- **FinanceTransaction**
  - `id`: UUID (PK).
  - `clinicianId`: UUID (FK).
  - `appointmentId`: UUID (FK, Nullable - Link para trazabilidad).
  - `type`: Enum (`INCOME`, `EXPENSE`).
  - `category`: String (ej. "Consulta", "Renta", "Servicios", "Materiales").
  - `amount`: Decimal (10, 2).
  - `date`: Date.
  - `description`: String.

---

## 3. LÓGICA DE NEGOCIO (THE SWITCH MAESTRO)

El sistema cambia su comportamiento UI/UX según `user.profile.type`.

### 3.1 Modo PSICÓLOGO

- **Dashboard:** Prioriza widgets de "Resumen de Sesiones" y "Notas Pendientes".
- **Paciente:** La vista principal es el `Timeline` (Chat cronológico de notas).
- **Sesión Activa:** Carga el `PsychNoteEditor` (Texto rico/SOAP).
- **Oculto:** Pestañas de "Mediciones", "Dietas".

### 3.2 Modo NUTRICIONISTA

- **Dashboard:** Prioriza widgets de "Pacientes en Seguimiento" y "Evolución de Peso".
- **Paciente:** La vista principal es el `MetricsGrid` (Gráficos de línea).
- **Sesión Activa:** Carga el `AnthropometryForm` (Inputs numéricos rápidos).
- **Oculto:** Pestañas de "Bitácora Emocional", "Crisis".

---

## 4. ESTÁNDARES DE API (CONTRACT)

Todas las respuestas REST deben seguir esta interfaz genérica para evitar errores de parseo en el frontend.

TypeScript

`export interface ApiResponse<T> {
  success: boolean;       // true si 2xx
  data: T;                // El payload real
  message?: string;       // Para Toasts (ej. "Guardado exitosamente")
  timestamp: string;      // ISO Date
  meta?: {                // Solo en listas paginadas
    total: number;
    page: number;
    limit: number;
  };
}`

---

## 5. DESIGN SYSTEM (VISUAL SPECS)

- **Layout:** Bento Box Grid (CSS Grid).
- **Estilo:** Limpio, Médico, Accesible.
- **Fuentes:** Roboto (Textos), Inter (Números).
- **Variables Globales (CSS):**
  - `-kanji-color`: `#8a72d1` (Brand Primary / Headings).
  - `-cruz-color`: `#ddd3fa` (Bordes / Separadores).
  - `-kio-color`: `#ae93fe` (Botones / Acentos).
  - `-kio-color-light`: `rgba(174, 147, 254, 0.15)` (Hover / Fondos tenues).
  - `-bg-app`: `#f8f9fa` (Fondo de pantalla).
  - `-bg-card`: `#ffffff` (Fondo de componentes).
  - `-text-main`: `#213547`.
  - `-radius-lg`: `24px` (Tarjetas).

---

## 6. WORKFLOWS FUNCIONALES (LÓGICA CRÍTICA)

### 6.1 Agenda Táctica & Mapa de Calor

1. **Backend:** Endpoint `GET /appointments/range?start=...&end=...`.
2. **Frontend Logic:** Agrupar citas por fecha `YYYY-MM-DD`.
3. **Visual:** Asignar clase CSS según densidad:
   - 0-3 citas: `bg-green-50` (Low).
   - 4-7 citas: `bg-yellow-50` (Med).
   - 8+ citas: `bg-red-50` (High - Saturado).
4. **Semáforo:** En cada celda de cita, mostrar círculo:
   - `status === PAID` -> Verde.
   - `status === PENDING` -> Rojo.

### 6.2 Finanzas Automatizadas (Closed Loop)

1. **Creación de Cita:** Al agendar, el sistema copia `ClinicianProfile.sessionDefaultPrice` -> `Appointment.price`. (El usuario puede editarlo manual si es necesario).
2. **Cobro:** Usuario marca cita como "Cobrada" (`PATCH paymentStatus: 'PAID'`).
3. **Trigger Backend:**
   - Verificar `Appointment.price > 0`.
   - Crear `FinanceTransaction` (`type: INCOME`, `amount: Appointment.price`, `appointmentId: ID`).
4. **Resultado:** El Dashboard de Finanzas se actualiza solo.

### 6.3 Lista de Espera (Waitlist)

1. **Agregar:** Cambiar `Patient.status` a `WAITLIST`.
2. **Visualización:** Panel lateral en Agenda ordenado por `updatedAt ASC` (FIFO).
3. **Relleno:** Al cancelar una cita (`status: CANCELLED`), el sistema destaca visualmente la lista de espera sugiriendo "Llamar a [Nombre del primero en lista]".
