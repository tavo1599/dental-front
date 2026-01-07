<script setup lang="ts">
import LogoDental from '@/components/icons/LogoDental.vue'
</script>

<template>
  <div class="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="p-8 sm:p-10">
        <!-- Encabezado con Logo -->
        <div class="flex items-center gap-4 border-b-2 border-primary pb-4 mb-6">
          <LogoDental alt="Logo de sistema" class_exists="" class="mx-auto h-24 w-auto text-primary" />
          <h1 class="text-3xl font-bold text-gray-800">Términos y Condiciones</h1>
        </div>

        <p class="text-sm text-gray-500 mb-6">Última actualización: 17 de Octubre de 2025</p>

        <div class="prose max-w-none text-gray-700">
          <p>Estos Términos y Condiciones ("Términos") rigen el uso de SonriAndes ("Software", "Servicio"), un software como servicio (SaaS) proporcionado por Sonriandes ("nosotros"). Al registrarse y utilizar nuestro Servicio, usted ("la Clínica", "el Usuario") acepta estos Términos en su totalidad.</p>

          <h2>1. Descripción del Servicio</h2>
          <p>SonriAndes es una plataforma de software para la gestión de clínicas dentales, que incluye gestión de pacientes, agenda, odontograma, facturación y otras herramientas clínicas y administrativas.</p>

          <h2>2. Cuentas y Registro</h2>
          <p>Usted debe ser un profesional de la salud dental o un representante autorizado de una clínica para crear una cuenta. Usted es responsable de toda la actividad que ocurra bajo su cuenta y de mantener la confidencialidad de su contraseña.</p>

          <h2>3. Uso Aceptable</h2>
          <p>Usted se compromete a no utilizar el Servicio para ningún propósito ilegal o no autorizado. Se compromete a cumplir con todas las leyes locales, incluidas, entre otras, las leyes de protección de datos y privacidad (Ley N° 29733).</p>

          <h2 class="text-red-600 font-bold">4. Responsabilidad sobre los Datos del Paciente</h2>
          <p>Usted (la Clínica) es el único responsable de la exactitud, calidad, integridad y legalidad de los datos de sus pacientes que ingresa al sistema. Usted declara y garantiza que ha obtenido todos los consentimientos necesarios de sus pacientes (incluido el consentimiento para el tratamiento de datos sensibles de salud) para cargar su información en nuestro Servicio.</p>
          <p>SonriAndes actúa únicamente como encargado del tratamiento de datos, proporcionando la plataforma tecnológica para su gestión.</p>

          <h2>5. Pagos y Suscripciones</h2>
          <p>El Servicio se factura por adelantado de forma mensual o anual. Las tarifas no son reembolsables. Si no se recibe el pago en la fecha de vencimiento, nos reservamos el derecho de suspender o cancelar el acceso al Servicio.</p>

          <h2>6. Limitación de Responsabilidad</h2>
          <p>El Servicio se proporciona "tal cual". No garantizamos que el servicio sea ininterrumpido o libre de errores. En la máxima medida permitida por la ley, [Nombre de tu Empresa] no será responsable de ningún daño directo, indirecto, incidental o consecuente que resulte del uso o la imposibilidad de usar el servicio.</p>

          <h2>7. Propiedad Intelectual</h2>
          <p>Nosotros poseemos todos los derechos de propiedad intelectual sobre el Software y el Servicio. Usted posee todos los derechos sobre los datos de sus pacientes.</p>

          <h2>8. Ley Aplicable</h2>
          <p>Estos Términos se regirán e interpretarán de conformidad con las leyes de la República del Perú.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose h2 {
  @apply text-xl font-bold mt-6 mb-2 border-b pb-1;
}
.prose p {
  @apply mb-4;
}
</style>