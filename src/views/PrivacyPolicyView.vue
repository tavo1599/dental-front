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
          <h1 class="text-3xl font-bold text-gray-800">Política de Privacidad</h1>
        </div>
        
        <p class="text-sm text-gray-500 mb-6">Última actualización: 17 de Octubre de 2025</p>
        
        <div class="prose max-w-none text-gray-700">
          <p>Bienvenido a SonriAndes ("nosotros", "nuestro"). Nos comprometemos a proteger la privacidad de la información de su clínica y de sus pacientes. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestro software de gestión dental ("Servicio").</p>

          <h2>1. Identidad del Responsable del Tratamiento</h2>
          <p>El responsable del banco de datos personales es [Nombre de tu Empresa/Persona Natural], con domicilio en [Tu Dirección, Lima, Perú].</p>

          <h2>2. Información que Recopilamos</h2>
          <p>Recopilamos dos tipos de información:</p>
          <ul>
            <li><strong>Información de la Clínica (Cliente):</strong> Datos de registro de su clínica (Nombre, RUC/DNI, dirección, teléfono, email) e información de los usuarios (doctores, asistentes).</li>
            <li><strong>Información de Pacientes (Datos Sensibles):</strong> Información demográfica, historial médico, anamnesis, odontogramas, presupuestos y citas que usted (la clínica) registra en nuestro sistema.</li>
          </ul>
          <p>De acuerdo con la Ley N° 29733, los datos de salud de los pacientes son considerados **datos sensibles**. La clínica es la responsable de obtener el consentimiento de sus pacientes para registrar esta información.</p>

          <h2>3. Finalidad del Tratamiento de Datos</h2>
          <p>Usamos la información recopilada para:</p>
          <ul>
            <li>Proveer, operar y mantener nuestro Servicio.</li>
            <li>Procesar pagos y gestionar su suscripción.</li>
            <li>Enviar comunicaciones administrativas y de soporte.</li>
            <li>Facilitar la gestión de citas y el envío de recordatorios a pacientes (en nombre de la clínica).</li>
          </ul>

          <h2 class="text-red-600 font-bold">4. Integración con Servicios de Terceros (Google y SendGrid)</h2>
          <p>Para mejorar la funcionalidad del Servicio, utilizamos las siguientes APIs de terceros, lo que implica una transferencia de datos limitada:</p>
          
          <h3>4.1. API de Google Calendar</h3>
          <p>Si usted decide conectar su cuenta de Google, nuestro Servicio solicitará acceso a su Google Calendar con el permiso <code>https://www.googleapis.com/auth/calendar.events</code>. Este permiso se utiliza **única y exclusivamente** para:</p>
          <ul>
            <li><strong>Crear eventos:</strong> Registrar automáticamente las citas agendadas en el sistema en su Google Calendar.</li>
            <li><strong>Añadir invitados:</strong> Enviar una invitación de Google Calendar al correo electrónico del paciente asociado a la cita.</li>
          </ul>
          <p><strong>No almacenamos, leemos ni compartimos ningún otro dato de su Google Calendar que no esté directamente relacionado con las citas creadas por nuestro Servicio.</strong> El uso de esta información se adhiere a la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener">Política de Datos de Usuario de los Servicios API de Google</a>.</p>

          <h3>4.2. SendGrid (Correos Electrónicos)</h3>
          <p>Utilizamos SendGrid para enviar correos transaccionales en su nombre (ej. recuperación de contraseña). Para esto, se comparte la dirección de correo electrónico del destinatario.</p>

          <h2>5. Seguridad y Confidencialidad</h2>
          <p>Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos, incluyendo encriptación SSL, contraseñas hasheadas y bases de datos seguras, de conformidad con la Ley N° 29733.</p>

          <h2>6. Derechos ARCO</h2>
          <p>Como titular de sus datos personales (administrador de la clínica), tiene derecho a ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición. Puede solicitarlo enviando un correo a dentalsoft9@gmail.com. La clínica es la responsable de atender las solicitudes ARCO de sus pacientes.</p>

          <h2>7. Tiempo de Conservación</h2>
          <p>Conservaremos los datos de su clínica mientras mantenga una cuenta activa. Los datos serán eliminados de forma segura después de 90 días tras la cancelación del servicio, a menos que se solicite su eliminación inmediata.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose h2 {
  @apply text-xl font-bold mt-6 mb-2 border-b pb-1;
}
.prose h3 {
  @apply text-lg font-semibold mt-4 mb-1;
}
.prose p, .prose ul {
  @apply mb-4;
}
.prose a {
  @apply text-primary hover:underline;
}
.prose code {
  @apply bg-gray-100 text-gray-800 p-1 rounded-md text-sm;
}
</style>