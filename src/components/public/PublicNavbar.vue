<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps<{
  tenantData: any; // Recibimos toda la info de la clínica
}>();

const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);

// Detectar scroll para cambiar estilo del navbar
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));

// Helpers visuales
const logoSrc = computed(() => {
  const url = props.tenantData?.logoUrl;
  if (!url) return null;
  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL}${url}`;
});

const whatsappLink = computed(() => {
  const number = props.tenantData?.websiteConfig?.whatsappNumber;
  if (!number) return '#';
  const text = encodeURIComponent(`Hola ${props.tenantData.name}, quisiera más información.`);
  return `https://wa.me/${number}?text=${text}`;
});

// Función para scroll suave
const scrollToSection = (id: string) => {
  isMobileMenuOpen.value = false; // Cerrar menú móvil al hacer clic
  const element = document.getElementById(id);
  if (element) {
    const offset = 80; // Compensar la altura del navbar fijo
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};
</script>

<template>
  <nav 
    class="fixed top-0 w-full z-50 transition-all duration-300 border-b"
    :class="[
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-md border-gray-100 py-2' 
        : 'bg-white border-transparent py-4'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        
        <!-- 1. LOGO + NOMBRE -->
        <div class="flex items-center gap-3 cursor-pointer" @click="scrollToSection('inicio')">
          <img v-if="logoSrc" :src="logoSrc" class="h-10 w-auto object-contain" alt="Logo" />
          <!-- Si no hay logo, mostramos icono de diente por defecto -->
          <div v-else class="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
             <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          
          <span class="font-bold text-xl md:text-2xl text-gray-800 tracking-tight leading-none">
            {{ tenantData?.name || 'Tu Clínica' }}
          </span>
        </div>

        <!-- 2. MENÚ ESCRITORIO (Centrado/Derecha) -->
        <div class="hidden md:flex items-center space-x-8">
          <button @click="scrollToSection('inicio')" class="nav-link">Inicio</button>
          <button @click="scrollToSection('especialidades')" class="nav-link">Especialidades</button>
          <button @click="scrollToSection('doctores')" class="nav-link" v-if="tenantData?.websiteConfig?.showStaff">Doctores</button>
          <button @click="scrollToSection('nosotros')" class="nav-link">Nosotros</button>
          <button @click="scrollToSection('contacto')" class="nav-link">Contacto</button>
        </div>

        <!-- 3. BOTÓN CTA (WhatsApp) -->
        <div class="hidden md:block">
          <a 
            v-if="tenantData?.websiteConfig?.whatsappNumber"
            :href="whatsappLink" 
            target="_blank"
            class="bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-primary/30 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <span>Agendar Cita</span>
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          </a>
        </div>

        <!-- BOTÓN MÓVIL (Hamburguesa) -->
        <div class="md:hidden flex items-center">
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-gray-600 hover:text-primary focus:outline-none">
            <svg v-if="!isMobileMenuOpen" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            <svg v-else class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

      </div>
    </div>

    <!-- MENÚ MÓVIL DESPLEGABLE -->
    <div v-show="isMobileMenuOpen" class="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
      <div class="px-4 pt-2 pb-6 space-y-2 flex flex-col">
        <button @click="scrollToSection('inicio')" class="mobile-nav-link">Inicio</button>
        <button @click="scrollToSection('especialidades')" class="mobile-nav-link">Especialidades</button>
        <button @click="scrollToSection('doctores')" class="mobile-nav-link" v-if="tenantData?.websiteConfig?.showStaff">Doctores</button>
        <button @click="scrollToSection('nosotros')" class="mobile-nav-link">Nosotros</button>
        <button @click="scrollToSection('contacto')" class="mobile-nav-link">Contactanos</button>
        
        <a v-if="tenantData?.websiteConfig?.whatsappNumber" :href="whatsappLink" target="_blank" class="mt-4 bg-green-500 text-white text-center py-3 rounded-lg font-bold flex justify-center items-center gap-2">
           <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
           Agendar por WhatsApp
        </a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-link {
  @apply text-gray-600 hover:text-primary font-medium transition-colors text-sm px-1 py-2 border-b-2 border-transparent hover:border-primary;
}

.mobile-nav-link {
  @apply text-left py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-primary font-medium rounded-lg transition-colors;
}

/* Usamos las variables CSS globales para que los colores se adapten */
.text-primary { color: var(--clinic-primary); }
.bg-primary { background-color: var(--clinic-primary); }
.border-primary { border-color: var(--clinic-primary); }
.shadow-primary\/30 { box-shadow: 0 10px 15px -3px rgba(var(--clinic-primary-rgb), 0.3); }
</style>