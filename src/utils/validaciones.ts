// reglas reutilizables para react-hook-form en todos los formularios del sistema

// bloquea < > { } — suficiente para prevenir HTML/script injection en campos de texto libre
const sinHtml = {
  value: /^[^<>{}]*$/,
  message: 'El campo contiene caracteres no permitidos.',
}

export const reglas = {
  nombre: {
    maxLength: { value: 100, message: 'Máximo 100 caracteres.' },
    pattern: sinHtml,
  },
  codigoTexto: {
    maxLength: { value: 50, message: 'Máximo 50 caracteres.' },
    pattern: sinHtml,
  },
  codigoNumerico: {
    pattern: { value: /^\d+$/, message: 'Solo se permiten números.' },
    maxLength: { value: 20, message: 'Máximo 20 dígitos.' },
  },
  correo: {
    // RFC 5322 simplificado — más estricto que el patrón básico de antes
    pattern: {
      value: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
      message: 'Formato de correo inválido.',
    },
    maxLength: { value: 254, message: 'Correo demasiado largo.' },
  },
  password: {
    minLength: { value: 8, message: 'Mínimo 8 caracteres.' },
    maxLength: { value: 128, message: 'Máximo 128 caracteres.' },
  },
}
