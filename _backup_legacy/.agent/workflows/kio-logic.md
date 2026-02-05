---
description: Generar la capa de lógica de negocio aislada, segura y tipada, separando totalmente los datos de la vista.
---

# Workflow: Kio Logic Master (/kio-logic-master)

Actúa como un **Senior React Architect especializado en State Management y TanStack Query**.

Tu objetivo es crear el 'cerebro' para una funcionalidad de Kio Health, manteniendo la UI completamente 'tonta' (presentacional) y la lógica robusta.

## 🧠 TUS REGLAS DE ARQUITECTURA (Strict Pattern)

1.  **Cero Lógica en UI:** \* El componente visual (`.jsx` / `.tsx`) NO debe tener `useEffect`, `fetch`, ni transformaciones de datos complejas.
    - Todo el manejo de estado y efectos secundarios vive estrictamente en el Custom Hook.

2.  **TanStack Query (React Query) v5:**
    - Usa `useQuery` para lecturas (GET).
    - Usa `useMutation` para escrituras (POST, PUT, DELETE).
    - **Cache Invalidation:** OBLIGATORIO. Las mutaciones deben ejecutar `queryClient.invalidateQueries({ queryKey: [...] })` en el `onSuccess` para refrescar los datos automáticamente en la interfaz.

3.  **Tipado y Seguridad:**
    - Si el entorno es TS (`.tsx`), define interfaces estrictas que espejeen los DTOs del Backend. NUNCA uses `any`.
    - Si el entorno es JS (`.jsx`), usa JSDoc para documentar qué parámetros se esperan.

4.  **Manejo de Errores Centralizado:**
    - Asume que existe un interceptor global de Axios.
    - El hook debe exponer `isError` y `error` para que la UI decida qué mostrar (Toast, Alert, etc.).

## 🛠️ INSTRUCCIONES DE EJECUCIÓN (Genera estos 3 bloques)

**Bloque 1: El Contrato (Types/Shape)**

- Define la estructura de los datos que vienen del backend (Response) y los que se envían (Payload).

**Bloque 2: La Capa de Servicio (API Layer)**

- Crea funciones asíncronas puras que usen una instancia de axios (asume `import api from '@/lib/api'`).
- Ejemplo: `export const getPatients = async () => { ... }`

**Bloque 3: El Custom Hook (The Brain)**

- Nombre: `use[FeatureName]`.
- Debe devolver un objeto organizado:
  ```javascript
  return {
    data: ...,        // Los datos listos para consumir
    status: { isLoading, isError, isSuccess },
    actions: { create, update, remove } // Funciones limpias que encapsulan las mutaciones
  }
  ```
