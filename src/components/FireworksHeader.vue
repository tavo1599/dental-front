<script setup lang="ts">
</script>

<template>
  <div class="party-container">
    <!-- Fuegos Artificiales (Esquinas) -->
    <div class="firework left"></div>
    <div class="firework right"></div>
    
    <!-- Serpentinas / Confeti -->
    <div class="streamer s1"></div>
    <div class="streamer s2"></div>
    <div class="streamer s3"></div>
    <div class="streamer s4"></div>
    <div class="streamer s5"></div>
  </div>
</template>

<style scoped>
.party-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%; /* Cubre el fondo pero no bloquea clicks */
  overflow: hidden;
  pointer-events: none;
  z-index: 1; 
}

/* --- FUEGOS ARTIFICIALES --- */
@keyframes firework {
  0% { transform: translate(var(--x), var(--initialY)); width: var(--initialSize); opacity: 1; }
  50% { width: 0.5rem; opacity: 1; }
  100% { width: var(--finalSize); opacity: 0; }
}

.firework,
.firework::before,
.firework::after {
  --initialSize: 0.5rem;
  --finalSize: 30rem; /* Un poco más pequeños para ser sutiles */
  --particleSize: 0.2rem;
  --color1: #FFD700; /* Dorado */
  --color2: #FF0000; /* Rojo */
  --color3: #00FF00; /* Verde */
  --color4: #00FFFF; /* Cyan */
  --color5: #FF00FF; /* Magenta */
  --color6: #FFFFFF; /* Blanco */
  
  content: "";
  animation: firework 2.5s infinite;
  position: absolute;
  top: 30%; /* Más arriba */
  width: var(--initialSize);
  aspect-ratio: 1;
  background: 
    radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 50% 0%,
    radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 100% 50%,
    radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 50% 100%,
    radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 0% 50%,
    radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 80% 90%,
    radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 95% 90%;
  background-size: var(--initialSize) var(--initialSize);
  background-repeat: no-repeat;
}

.firework::before {
  transform: translate(-50%, -50%) rotate(40deg) scale(1.3) rotateY(40deg);
}
.firework::after {
  transform: translate(-50%, -50%) rotate(170deg) scale(1.15) rotateY(-30deg);
}

/* Posiciones estratégicas */
.firework.left {
  left: 10%;
  --x: -50%;
  --initialY: 40vmin;
  --y: -30vmin;
  animation-delay: 0.5s;
}

.firework.right {
  left: 90%;
  --x: -50%;
  --initialY: 40vmin;
  --y: -30vmin;
  animation-delay: 1.5s;
}

/* --- SERPENTINAS (CONFETI) --- */
@keyframes fall {
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

.streamer {
  position: absolute;
  width: 8px;
  height: 25px;
  top: -20px;
  animation: fall linear infinite;
}

.s1 { left: 15%; background: #FFD700; animation-duration: 4s; animation-delay: 0s; }
.s2 { left: 35%; background: #FF4500; animation-duration: 5s; animation-delay: 1s; }
.s3 { left: 55%; background: #32CD32; animation-duration: 3.5s; animation-delay: 2s; }
.s4 { left: 75%; background: #1E90FF; animation-duration: 4.5s; animation-delay: 0.5s; }
.s5 { left: 90%; background: #FF69B4; animation-duration: 4s; animation-delay: 3s; }

</style>