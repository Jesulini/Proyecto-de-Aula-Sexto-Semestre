export function mapFirebaseError(err: any): string {
  if (!err) return 'Ocurrió un error';
  const code = err?.code || err?.message || String(err);

  // ===== Autenticación =====
  if (code.includes('auth/invalid-email')) return 'El correo electrónico no es válido';
  if (code.includes('auth/missing-email')) return 'Debes ingresar un correo electrónico';
  if (code.includes('auth/email-already-in-use')) return 'El correo ya está en uso';
  if (code.includes('auth/user-not-found')) return 'Usuario no encontrado';
  if (code.includes('auth/user-disabled')) return 'La cuenta ha sido deshabilitada, contacta soporte';
  if (code.includes('auth/invalid-login-credentials')) return 'Credenciales inválidas: correo o contraseña incorrectos';
  if (code.includes('auth/wrong-password')) return 'Contraseña incorrecta';
  if (code.includes('auth/missing-password')) return 'Debes ingresar una contraseña';
  if (code.includes('auth/weak-password')) return 'La contraseña es demasiado débil';
  if (code.includes('auth/too-many-failed-attempts')) return 'Demasiados intentos fallidos, espera un momento';
  if (code.includes('auth/requires-recent-login')) return 'Debes volver a iniciar sesión para realizar esta acción';
  if (code.includes('auth/session-expired')) return 'Tu sesión ha expirado, inicia sesión nuevamente';
  if (code.includes('auth/operation-not-allowed')) return 'Este método de inicio de sesión no está habilitado';
  if (code.includes('auth/account-exists-with-different-credential')) return 'Ya existe una cuenta con otro método de acceso';
  if (code.includes('auth/credential-already-in-use')) return 'Estas credenciales ya están en uso';

  // ===== Conexión / Red =====
  if (code.includes('auth/network-request-failed')) return 'Error de red, revisa tu conexión';
  if (code.includes('auth/internal-error')) return 'Error interno, intenta de nuevo más tarde';
  if (code.includes('auth/timeout')) return 'La solicitud tardó demasiado, revisa tu conexión';

  // ===== Storage =====
  if (code.includes('PUT failed')) return 'Error al subir el archivo. Revisa la conexión o permisos';
  if (code.includes('storage/object-not-found')) return 'Archivo no encontrado en el almacenamiento';

  // ===== Firestore / Base de datos =====
  if (code.includes('permission-denied')) return 'No tienes permisos para acceder a estos datos';
  if (code.includes('unauthenticated')) return 'Debes iniciar sesión para acceder a esta información';
  if (code.includes('not-found')) return 'El documento solicitado no existe';
  if (code.includes('already-exists')) return 'El documento ya existe';
  if (code.includes('cancelled')) return 'La operación fue cancelada';
  if (code.includes('deadline-exceeded')) return 'La operación tardó demasiado, intenta de nuevo';
  if (code.includes('resource-exhausted')) return 'Se alcanzó el límite de recursos, intenta más tarde';
  if (code.includes('unavailable')) return 'El servicio no está disponible temporalmente';
  if (code.includes('aborted')) return 'La operación fue abortada, intenta nuevamente';
  if (code.includes('failed-precondition')) return 'La operación no cumple las condiciones necesarias';
  if (code.includes('internal')) return 'Error interno de Firestore';
  if (code.includes('unknown')) return 'Error desconocido en Firestore';

  // ===== Validaciones personalizadas (Home y formularios) =====
  if (code.includes('auth/missing-fields')) return 'Completa todos los campos obligatorios';
  if (code.includes('auth/invalid-display-name')) return 'El nombre debe tener al menos 3 caracteres';
  if (code.includes('auth/display-name-too-long')) return 'El nombre no puede superar los 30 caracteres';
  if (code.includes('auth/display-name-invalid-chars')) return 'El nombre solo puede contener letras, números y espacios';
  if (code.includes('auth/email-too-long')) return 'El correo es demasiado largo';
  if (code.includes('auth/password-too-long')) return 'La contraseña es demasiado larga';
  if (code.includes('auth/password-not-strong')) return 'La contraseña debe incluir mayúscula, número y símbolo';
  if (code.includes('auth/password-mismatch')) return 'Las contraseñas no coinciden';

  // ===== Errores comunes en Home =====
  if (code.includes('guardar-pelicula')) return 'Error al guardar la película';
  if (code.includes('eliminar-pelicula')) return 'Error al eliminar la película';
  if (code.includes('cargar-peliculas')) return 'Error al cargar las películas';

  // ===== Errores comunes en Mi Lista / Historial =====
  if (code.includes('cargar-mi-lista')) return 'Error al cargar tu lista de películas';
  if (code.includes('cargar-historial')) return 'Error al cargar tu historial de reproducción';
  if (code.includes('eliminar-mi-lista')) return 'Error al eliminar la película de tu lista';
  if (code.includes('eliminar-historial')) return 'Error al eliminar la película del historial';

  return typeof err === 'string'
    ? err
    : err.message
    ? err.message
    : 'Error desconocido';
}
