<script setup lang="ts">
// No requiere lógica JS, todo es CSS mágico
</script>

<template>
  <ul class="christmas-lights">
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
  </ul>
</template>

<style scoped>
.christmas-lights {
  position: absolute;
  top: -15px; /* Ajusta esto para que cuelgue del borde */
  left: 0;
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  pointer-events: none; /* Importante: Para que no bloquee clics en botones debajo */
  z-index: 9999; /* Siempre encima */
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-around;
}

.christmas-lights li {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
  display: inline-block;
  width: 12px;
  height: 24px;
  border-radius: 50%;
  background-color: #fff;
  animation-fill-mode: both;
  animation-iteration-count: infinite;
  margin: 0 15px; /* Espacio entre luces */
}

/* El cable */
.christmas-lights li:before {
  content: "";
  position: absolute;
  background: #222;
  width: 100%;
  height: 8px; /* Altura del cable curvo */
  border-bottom: 2px solid #222; /* Grosor del cable */
  border-radius: 50%;
  top: -6px;
  left: 0;
}

/* Animación de colores alternos */
.christmas-lights li:nth-child(2n+1) {
  animation-name: flash-1;
  animation-duration: 1.5s;
}

.christmas-lights li:nth-child(4n+2) {
  animation-name: flash-2;
  animation-duration: 2.2s;
}

.christmas-lights li:nth-child(odd) {
  animation-name: flash-3;
  animation-duration: 2.8s;
}

.christmas-lights li:nth-child(3n) {
  animation-name: flash-1;
  animation-duration: 1.8s;
}

@keyframes flash-1 {
  0%, 100% { background: #f00; box-shadow: 0px 5px 24px 3px #f00; }
  50% { background: rgba(255, 0, 0, 0.4); box-shadow: 0px 2px 5px 1px rgba(255, 0, 0, 0.2); }
}

@keyframes flash-2 {
  0%, 100% { background: #0f0; box-shadow: 0px 5px 24px 3px #0f0; }
  50% { background: rgba(0, 255, 0, 0.4); box-shadow: 0px 2px 5px 1px rgba(0, 255, 0, 0.2); }
}

@keyframes flash-3 {
  0%, 100% { background: #ff0; box-shadow: 0px 5px 24px 3px #ff0; }
  50% { background: rgba(255, 255, 0, 0.4); box-shadow: 0px 2px 5px 1px rgba(255, 255, 0, 0.2); }
}
</style>