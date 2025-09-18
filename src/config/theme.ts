// src/config/theme.ts

// Función para convertir HEX a "R G B" que Tailwind necesita
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
}

export const themes: Record<string, any> = {
  default: {
    name: 'Clínica Azul (Por Defecto)',
    colors: {
      '--color-primary': hexToRgb('#2563EB'),     // Azul
      '--color-secondary': hexToRgb('#10B981'),   // Verde
      '--color-background': hexToRgb('#F1F5F9'), // Gris claro
      '--color-text': hexToRgb('#1E293B'),       // Gris oscuro
    }
  },
  dark_mode: {
    name: 'Modo Oscuro',
    colors: {
      '--color-primary': hexToRgb('#3B82F6'),     // Azul brillante
      '--color-secondary': hexToRgb('#14B8A6'),   // Verde azulado brillante
      '--color-background': hexToRgb('#111827'), // Gris muy oscuro
      '--color-text': hexToRgb('#E5E7EB'),       // Gris claro (casi blanco)
    }
  },
  mint: {
    name: 'Verde Menta',
    colors: {
      '--color-primary': hexToRgb('#059669'),     // Verde oscuro
      '--color-secondary': hexToRgb('#F9A825'),   // Amarillo mostaza
      '--color-background': hexToRgb('#F0FDF4'), // Fondo verde muy pálido
      '--color-text': hexToRgb('#1F2937'),       // Gris oscuro
    }
  },
  cherry: {
    name: 'Cereza Sofisticado',
    colors: {
      '--color-primary': hexToRgb('#9F1239'),     // Rojo cereza oscuro
      '--color-secondary': hexToRgb('#FACC15'),   // Amarillo
      '--color-background': hexToRgb('#FEF2F2'), // Fondo rojo muy pálido
      '--color-text': hexToRgb('#111827'),       // Gris muy oscuro
    }
  },
};