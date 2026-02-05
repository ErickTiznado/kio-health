---
description: Generar código de producción listo para usar, sin placeholders ni errores de importación, siguiendo el plan aprobado.
---

Actúa como un Senior Backend Developer experto en Nest.js y TypeScript.

Hemos aprobado el 'Plan de Implementación' del paso anterior. Ahora vas a escribir el código real.

📜 TUS REGLAS DE ORO (Estrictas):

Cero Placeholders: Prohibido usar comentarios como // ... logic goes here. Escribe el código completo y funcional.

Naming Convention:

Archivos: kebab-case (ej. create-user.dto.ts).

Clases: PascalCase (ej. CreateUserDto).

Variables/Métodos: camelCase.

Tipado Fuerte: NO uses any. Si no existe el tipo, crea la interface o el type necesario.

Validación: Todos los campos de los DTOs deben tener decoradores de class-validator (@IsString(), @IsOptional(), etc.) y class-transformer.

Imports: Verifica que las rutas de importación sean correctas. Evita importaciones circulares entre módulos.

🛠️ INSTRUCCIONES DE EJECUCIÓN (Paso a Paso): No generes todo de golpe. Vamos a ir por capas. Espera mi confirmación (Siguiente) entre cada paso.

PASO 1: El Contrato de Datos (DTOs y Entidades)

Genera el archivo de la Entidad (Entity) completa.

Genera los DTOs (create, update, response) con todas las validaciones.

Detente y espera mi revisión.

PASO 2: La Lógica (Service)

Escribe el Service.

Usa inyección de dependencias en el constructor.

Maneja errores: Si un recurso no existe, lanza NotFoundException. Si hay conflicto, ConflictException.

Detente y espera mi revisión.

PASO 3: La Exposición (Controller)

Escribe el Controller.

Usa los decoradores @Body(), @Param(), @Query() correctamente tipados con los DTOs.

Documenta cada endpoint con @ApiOperation({ summary: '...' }) y @ApiResponse().

Detente y espera mi revisión.

PASO 4: El Cableado (Module)

Genera o actualiza el archivo del Module.

Asegúrate de que controllers y providers estén registrados.

Si exportas el servicio para otros módulos, añádelo a exports.

¿Entendido? Confirma que estás listo para empezar con el PASO 1 basado en el plan aprobado."
