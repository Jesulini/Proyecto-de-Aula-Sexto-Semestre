export function mapFirebaseError(err: any): string {
  if (!err) return 'Ocurrió un error';
  const code = err?.code || err?.message || String(err);
  if (code.includes('auth/invalid-email')) return 'El correo no es válido';
  if (code.includes('auth/email-already-in-use')) return 'El correo ya está en uso';
  if (code.includes('auth/requires-recent-login')) return 'Acción sensible: vuelve a iniciar sesión para continuar';
  if (code.includes('auth/wrong-password')) return 'Contraseña incorrecta';
  if (code.includes('auth/weak-password')) return 'La contraseña es demasiado débil';
  if (code.includes('PUT failed')) return 'Error al subir el archivo. Revisa la conexión o permisos';
  if (code.includes('auth/user-not-found')) return 'Usuario no encontrado';
  if (code.includes('auth/too-many-requests')) return 'Demasiados intentos. Intenta más tarde';
  if (code.includes('auth/network-request-failed')) return 'Error de red. Verifica tu conexión';
  if (code.includes('permission denied')) return 'No tienes permisos para realizar esta acción';
  if (code.includes('storage/object-not-found')) return 'Archivo no encontrado en el almacenamiento';

  return typeof err === 'string' ? err : err.message ? err.message : 'Error desconocido';
}
