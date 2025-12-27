<script setup lang="ts">
// No requiere props complejas, solo envuelve el contenido
</script>

<template>
  <!-- 
    IMPORTANTE: Usamos 'inline-flex' para que el div se ajuste al tamaño exacto de la imagen.
    'relative' es necesario para que el gorro (absolute) se posicione respecto a este div.
  -->
  <div class="relative inline-flex justify-center items-center">
    
    <!-- El Gorro SVG -->
    <div class="santa-hat-overlay">
      <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
         <path fill="#D32F2F" d="M414.94 133.5c-37.33-64.88-125.04-71.21-125.04-71.21s-33.89 44.97-62.8 111.4c-25.26 58.07-27.18 97.43-14.7 122.95 9.77 19.98 25.43 27.65 42.14 26.65l226.7-12.87c24.01-1.36 29.54-32.96 11.23-57.94-27.27-37.19-58.26-85.45-77.53-118.98z"/>
         <path fill="#FFF" d="M192.01 292.04c-3.14-1.84-25.21-17.1-23.77-51.46 1.15-27.35 18.05-39.69 22.02-42.36-12.63 24.23-14.93 52.88 1.75 93.82z"/>
         <circle fill="#FFF" cx="66.5" cy="235.5" r="46.5"/>
         <path fill="#FFF" d="M473.58 329.83l-246.36 13.99c-20.9 1.19-33.15-22.92-21.2-41.67 4.14-6.49 10.97-10.73 18.66-11.17l246.35-13.99c20.9-1.19 33.15 22.91 21.2 41.67-4.13 6.49-10.96 10.73-18.65 11.17z"/>
      </svg>
    </div>
    
    <!-- Aquí va tu logo original -->
    <slot></slot>
  </div>
</template>

<style scoped>
.santa-hat-overlay {
  position: absolute;

  top: -15px;  
  left: -20px; 
  width: 60px; 
  height: 60px;
  z-index: 50;  transform: rotate(-25deg);
  pointer-events: none;
  filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));
}
</style>