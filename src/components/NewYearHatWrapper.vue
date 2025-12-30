<script setup lang="ts">
// Wrapper decorativo: Sombrero de Copa para Año Nuevo con "2026"
</script>

<template>
  <div class="relative inline-flex justify-center items-center">
    
    <!-- Sombrero de Copa de Año Nuevo -->
    <div class="hat-overlay">
      <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <!-- Copa del sombrero -->
        <path d="M130,380 L150,140 L362,140 L382,380 Z" fill="#1a1a1a" />
        
        <!-- Cinta Dorada -->
        <rect x="132" y="320" width="248" height="60" fill="#FFD700" />
        
        <!-- TEXTO 2026 EN LA CINTA -->
        <text 
          x="256" 
          y="375" 
          font-family="Arial, sans-serif" 
          font-weight="900" 
          font-size="60" 
          fill="#1a1a1a" 
          text-anchor="middle"
          letter-spacing="2"
        >2026</text>

        <!-- Ala del sombrero -->
        <path d="M60,380 Q256,450 452,380 L452,410 Q256,480 60,410 Z" fill="#1a1a1a" />
        
        <!-- Brillo Cinta (Sutil) -->
        <path d="M160,320 L180,380 L210,320 Z" fill="#FFF" opacity="0.3" />
        
        <!-- Brillo Copa -->
        <path d="M160,150 L155,300" stroke="#FFF" stroke-width="10" opacity="0.1" stroke-linecap="round" />
        
        <!-- Estrellita decorativa animada en la punta -->
        <path d="M370,140 L385,100 L400,140 L370,140" fill="#FFD700" class="star-blink" />
      </svg>
    </div>
    
    <!-- Contenido original (Logo) -->
    <slot></slot>
  </div>
</template>

<style scoped>
.hat-overlay {
  position: absolute;
  /* Posición ajustada para caer sobre la esquina del logo */
  top: -28px;  
  left: -10px; 
  width: 70px; 
  height: 70px;
  z-index: 50; 
  transform-origin: bottom center; 
  pointer-events: none;
  filter: drop-shadow(3px 3px 4px rgba(0,0,0,0.3));
  
  /* Animación de entrada: Caída con rebote */
  animation: hatBounce 1.2s cubic-bezier(0.36, 0, 0.66, -0.56) forwards;
  /* cubic-bezier ajustado para dar sensación de gravedad/rebote */
}

/* Keyframes para el efecto de rebote al caer */
@keyframes hatBounce {
  0% {
    transform: translateY(-80px) rotate(0deg);
    opacity: 0;
  }
  40% {
    transform: translateY(0) rotate(-30deg); /* Aterriza inclinado */
    opacity: 1;
  }
  60% {
    transform: translateY(-15px) rotate(-20deg); /* Rebota un poco enderezándose */
  }
  80% {
    transform: translateY(0) rotate(-30deg); /* Cae de nuevo */
  }
  90% {
    transform: translateY(-4px) rotate(-28deg); /* Pequeño rebote final */
  }
  100% {
    transform: translateY(0) rotate(-30deg); /* Posición final */
  }
}

/* Animación para la estrellita (titileo) */
.star-blink {
  animation: twinkle 1.5s infinite alternate;
  transform-origin: center;
  transform-box: fill-box;
}

@keyframes twinkle {
  0% { opacity: 0.4; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.2) rotate(15deg); }
}
</style>