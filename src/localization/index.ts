import i18next from 'i18next';

const resources = {
  en: {
    translation: {
      'user.created': 'User created successfully',
      'user.updated': 'User updated successfully',
      'user.deleted': 'User deleted successfully',
      'user.not_found': 'User not found',
      'user.email_exists': 'A user with this email already exists',
      'validation.required': '{{field}} is required',
      'validation.invalid_email': 'Invalid email format',
      'auth.unauthorized': 'Unauthorized access',
      'auth.forbidden': 'Access forbidden',
      'server.error': 'Internal server error',
    },
  },
  es: {
    translation: {
      'user.created': 'Usuario creado exitosamente',
      'user.updated': 'Usuario actualizado exitosamente',
      'user.deleted': 'Usuario eliminado exitosamente',
      'user.not_found': 'Usuario no encontrado',
      'user.email_exists': 'Ya existe un usuario con este correo electrónico',
      'validation.required': '{{field}} es requerido',
      'validation.invalid_email': 'Formato de email inválido',
      'auth.unauthorized': 'Acceso no autorizado',
      'auth.forbidden': 'Acceso prohibido',
      'server.error': 'Error interno del servidor',
    },
  },
};

i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export const t = i18next.t.bind(i18next);
export const changeLanguage = i18next.changeLanguage.bind(i18next);