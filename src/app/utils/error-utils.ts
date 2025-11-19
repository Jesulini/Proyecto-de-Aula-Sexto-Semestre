// utils/error-utils.ts

// "Mapa centralizado de errores Firebase y personalizados"
export const firebaseErrorMap: Record<string, string> = {
  // Autenticación
  // "Errores relacionados con login, registro y credenciales"
  'auth/invalid-email': 'El correo electrónico no es válido',
  'auth/missing-email': 'Debes ingresar un correo electrónico',
  'auth/email-already-in-use': 'El correo ya está en uso',
  'auth/user-not-found': 'Usuario no encontrado',
  'auth/user-disabled': 'La cuenta ha sido deshabilitada, contacta soporte',
  'auth/invalid-login-credentials': 'Credenciales inválidas: correo o contraseña incorrectos',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/missing-password': 'Debes ingresar una contraseña',
  'auth/weak-password': 'La contraseña es demasiado débil',
  'auth/too-many-failed-attempts': 'Demasiados intentos fallidos, espera un momento',
  'auth/requires-recent-login': 'Debes volver a iniciar sesión para realizar esta acción',
  'auth/session-expired': 'Tu sesión ha expirado, inicia sesión nuevamente',
  'auth/operation-not-allowed': 'Este método de inicio de sesión no está habilitado',
  'auth/account-exists-with-different-credential': 'Ya existe una cuenta con otro método de acceso',
  'auth/credential-already-in-use': 'Estas credenciales ya están en uso',
  'auth/network-request-failed': 'Error de red, revisa tu conexión',
  'auth/internal-error': 'Error interno, intenta de nuevo más tarde',
  'auth/timeout': 'La solicitud tardó demasiado, revisa tu conexión',
  'auth/invalid-api-key': 'La clave de API no es válida',
  'auth/app-not-authorized': 'La aplicación no está autorizada para usar Firebase Authentication',
  'auth/argument-error': 'Error en los argumentos de la función',
  'auth/invalid-user-token': 'El token del usuario no es válido',
  'auth/invalid-tenant-id': 'El tenant ID no es válido',
  'auth/multi-factor-auth-required': 'Se requiere autenticación multifactor',
  'auth/multi-factor-info-not-found': 'No se encontró la información de segundo factor',
  'auth/multi-factor-session-expired': 'La sesión multifactor ha expirado',
  'auth/second-factor-already-in-use': 'Este segundo factor ya está en uso',
  'auth/unsupported-persistence-type': 'Tipo de persistencia no soportado',
  'auth/web-storage-unsupported': 'El navegador no soporta almacenamiento web necesario para la sesión',
  'auth/invalid-verification-code': 'El código de verificación no es válido',
  'auth/invalid-verification-id': 'El ID de verificación no es válido',
  'auth/missing-verification-code': 'Falta el código de verificación',
  'auth/missing-verification-id': 'Falta el ID de verificación',
  'auth/phone-number-already-exists': 'El número de teléfono ya está en uso',
  'auth/invalid-phone-number': 'El número de teléfono no es válido',
  'auth/missing-phone-number': 'Debes ingresar un número de teléfono',
  'auth/quota-exceeded': 'Se excedió la cuota de solicitudes, intenta más tarde',

  // Storage
  // "Errores relacionados con Firebase Storage"
  'storage/object-not-found': 'Archivo no encontrado en el almacenamiento',
  'storage/unauthorized': 'No tienes permisos para acceder a este archivo',
  'storage/canceled': 'La operación de subida fue cancelada',
  'storage/invalid-checksum': 'El archivo subido no coincide con el checksum esperado',
  'storage/retry-limit-exceeded': 'Se excedió el límite de reintentos al subir el archivo',
  'storage/invalid-argument': 'Argumento inválido en la operación de Storage',
  'storage/invalid-url': 'La URL de descarga no es válida',

  // Firestore / Base de datos
  // "Errores relacionados con consultas y operaciones en Firestore"
  'permission-denied': 'No tienes permisos para acceder a estos datos',
  'unauthenticated': 'Debes iniciar sesión para acceder a esta información',
  'not-found': 'El documento solicitado no existe',
  'already-exists': 'El documento ya existe',
  'cancelled': 'La operación fue cancelada',
  'deadline-exceeded': 'La operación tardó demasiado, intenta de nuevo',
  'resource-exhausted': 'Se alcanzó el límite de recursos, intenta más tarde',
  'unavailable': 'El servicio no está disponible temporalmente',
  'aborted': 'La operación fue abortada, intenta nuevamente',
  'failed-precondition': 'La operación no cumple las condiciones necesarias',
  'internal': 'Error interno de Firestore',
  'unknown': 'Error desconocido en Firestore',
  'data-loss': 'Se detectó posible pérdida de datos',
  'out-of-range': 'El valor está fuera del rango permitido',
  'invalid-argument': 'Argumento inválido en la consulta',
  'unimplemented': 'La operación no está implementada en Firestore',

  // General / SDK
  // "Errores generales del SDK de Firebase"
  'app-deleted': 'La aplicación Firebase fue eliminada',
  'invalid-app-id': 'El ID de la aplicación no es válido',
  'invalid-project-id': 'El ID del proyecto no es válido',
  'duplicate-app': 'Ya existe una instancia de la aplicación con ese nombre',
  'invalid-persistence': 'Persistencia inválida configurada en Firebase',
  'invalid-credential': 'Las credenciales proporcionadas no son válidas',
  'missing-credential': 'Faltan credenciales para realizar esta operación',
  'invalid-provider-id': 'El proveedor de autenticación no es válido',
  'unsupported-tenant-operation': 'Operación no soportada para este tenant',

  // Validaciones personalizadas
  // "Errores definidos por reglas de negocio y formularios"
  'auth/missing-fields': 'Completa todos los campos obligatorios',
  'auth/invalid-display-name': 'El nombre debe tener al menos 3 caracteres',
  'auth/display-name-too-long': 'El nombre no puede superar los 30 caracteres',
  'auth/display-name-invalid-chars': 'El nombre solo puede contener letras, números y espacios',
  'auth/email-too-long': 'El correo es demasiado largo',
  'auth/password-too-long': 'La contraseña es demasiado larga',
  'auth/password-not-strong': 'La contraseña debe incluir mayúscula, número y símbolo',
  'auth/password-mismatch': 'Las contraseñas no coinciden',

  // Errores comunes en Home
  // "Errores frecuentes en operaciones de películas"
  'guardar-pelicula': 'Error al guardar la película',
  'eliminar-pelicula': 'Error al eliminar la película',
  'cargar-peliculas': 'Error al cargar las películas',

  // Errores comunes en Mi Lista / Historial
  // "Errores frecuentes en listas y historial de usuario"
  'cargar-mi-lista': 'Error al cargar tu lista de películas',
  'cargar-historial': 'Error al cargar tu historial de reproducción',
  'eliminar-mi-lista': 'Error al eliminar la película de tu lista',
  'eliminar-historial': 'Error al eliminar la película del historial',

  // Errores personalizados de negocio
  // "Validaciones internas de CompraPage y solicitudes"
  'suscripcion/ya-activa': 'Ya tienes activa esta suscripción',
  'solicitud/missing-fields': 'Completa todos los campos de la solicitud',
  'solicitud/error': 'Error al registrar la solicitud de película',
};

// "Función que traduce cualquier error a un mensaje amigable"
export function mapFirebaseError(err: any): string {
  if (!err) return 'Ocurrió un error';
  const code = err?.code || err?.message || String(err);

  if (firebaseErrorMap[code]) return firebaseErrorMap[code];

  return typeof err === 'string'
    ? err
    : err.message
    ? err.message
    : 'Error desconocido';
}
