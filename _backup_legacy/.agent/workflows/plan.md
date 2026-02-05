---
description: Antes de escribir una sola línea, la IA debe entender el impacto. Este workflow evita el "código espagueti" obligando a la IA a pensar antes de actuar.
---

Quiero implementar una nueva funcionalidad. NO escribas código todavía. Primero, actúa como Arquitecto de Software y genera un Plan de Implementación (Blueprint) en formato Markdown que incluya:

Análisis de Requerimientos: Resume qué vamos a construir y por qué.

Estructura de Datos (Entidades): Define los campos, tipos de datos y relaciones (OneToMany, etc.) para la base de datos.

Definición de DTOs:

CreateDto: Qué datos entran (con validaciones).

UpdateDto: Qué datos se pueden modificar.

ResponseDto: Qué datos salen (excluyendo datos sensibles).

Endpoints (API Contract): Lista las rutas, métodos HTTP (GET, POST, etc.) y códigos de estado esperados.

Lógica de Negocio (Pseudocódigo): Pasos lógicos que realizará el Servicio.

Espera mi aprobación de este plan antes de generar cualquier archivo.
