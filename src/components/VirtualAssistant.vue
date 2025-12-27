<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router'; 
import apiClient from '@/services/api'; 
import { useAppointmentsStore } from '@/stores/appointments';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const appointmentsStore = useAppointmentsStore();
const router = useRouter();
const { appointments, nextDayPending } = storeToRefs(appointmentsStore);

const showBubble = ref(false);
const message = ref('');
const alertType = ref<'info' | 'warning' | 'success'>('info');
const targetRoute = ref<string | null>(null); 

let assistantInterval: number | null = null;
let cycleCount = 0;
// Nuevo: Índice para rotar alertas manualmente
let manualAlertIndex = 0;

// Tipo de dato para las alertas
type AssistantAlert = { text: string, type: 'info' | 'warning' | 'success', route: string | null };

// --- FRASES Y TIPS ---
const motivationalQuotes = [
  "¡Cada sonrisa que recuperas es una obra de arte! 🎨",
  "Recuerda cuidar tu postura y estirar la espalda entre pacientes. 🧘‍♂️",
  "Tu dedicación transforma vidas. ¡Sigue así! 💪",
  "Un buen diagnóstico es el comienzo de una gran sonrisa. 🦷",
  "¡No olvides hidratarte! Bebe un poco de agua. 💧",
  "La paciencia y la delicadeza son tus mejores herramientas.",
  "¡Hoy será un día productivo y lleno de éxitos! 🌟",
  "Gracias por cuidar la salud de tus pacientes con tanta pasión.",
  "Tómate un respiro de 1 minuto, cierra los ojos y relájate. 😌",
];

const speak = (text: string, type: 'info' | 'warning' | 'success' = 'info', route: string | null = null) => {
  // Si se llama manualmente, forzamos la muestra incluso si ya había algo
  message.value = text;
  alertType.value = type;
  targetRoute.value = route;
  showBubble.value = true;

  // Auto-ocultar a los 12 segundos
  setTimeout(() => {
    // Solo ocultar si el mensaje sigue siendo el mismo
    if (message.value === text) showBubble.value = false;
  }, 12000);
};

const handleBubbleClick = () => {
  if (targetRoute.value) {
    router.push(targetRoute.value);
  }
  showBubble.value = false;
};

const showRandomTip = () => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  speak(motivationalQuotes[randomIndex], 'success');
};

// ==========================================
// LÓGICA DE ALERTAS (Devuelven datos)
// ==========================================

// 1. ALERTAS DE AGENDA MAÑANA
const checkTomorrowLogistics = async (silent = false): Promise<AssistantAlert | null> => {
  const user = authStore.user;
  if (!user) return null;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  try {
    const response = await apiClient.get('/appointments', {
       params: { startDate: dateStr, endDate: dateStr }
    });
    
    const allApps = response.data || [];
    const currentTenantId = user.tenant?.id;

    const activeApps = allApps.filter((a: any) => {
        const appTenantId = a.tenant?.id || a.doctor?.tenant?.id;
        if (currentTenantId && appTenantId && appTenantId !== currentTenantId) return false;
        
        const appDate = new Date(a.startTime);
        const isSameDay = appDate.getDate() === tomorrow.getDate() && appDate.getMonth() === tomorrow.getMonth();
        return isSameDay && a.status !== 'cancelled';
    });

    if (user.role === 'dentist' || user.role === 'admin') {
        const myApps = activeApps.filter((a: any) => a.doctor?.id === user.id);
        
        if (myApps.length > 0) {
            const msg = `📅 <strong>Mañana:</strong> Tienes <strong>${myApps.length} pacientes</strong> agendados.`;
            if (!silent) speak(msg.replace(/<[^>]*>/g, ''), 'warning', '/appointments');
            return { text: msg, type: 'warning', route: '/appointments' };
        }
        
        if (user.role === 'dentist') {
             const msg = `📅 <strong>Mañana:</strong> Agenda libre por el momento.`;
             if (!silent) speak(msg.replace(/<strong>/g, '').replace(/<\/strong>/g, ''), 'info', '/appointments');
             return { text: msg, type: 'info', route: '/appointments' };
        }
    }

    if (user.role === 'assistant' || (user.role === 'admin' && activeApps.length > 0)) {
        if (user.role === 'admin') return null; 
        
        if (activeApps.length > 0) {
            const msg = `📅 <strong>Mañana (Global):</strong> Hay <strong>${activeApps.length} citas</strong> en la clínica.`;
            if (!silent) speak(msg.replace(/<[^>]*>/g, ''), 'info', '/appointments');
            return { text: msg, type: 'info', route: '/appointments' };
        } else {
            const msg = `📅 <strong>Mañana:</strong> La agenda está libre.`;
            if (!silent) speak(msg.replace(/<[^>]*>/g, ''), 'info', '/appointments');
            return { text: msg, type: 'info', route: '/appointments' };
        }
    }

  } catch (e) {
    // Silencioso
  }
  return null;
};

// 2. RESUMEN DEL DÍA ACTUAL
const checkTodayLogistics = async (silent = false): Promise<AssistantAlert | null> => {
  const user = authStore.user;
  if (!user) return null;
  const currentTenantId = user.tenant?.id;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  try {
    const response = await apiClient.get('/appointments', {
       params: { startDate: todayStr, endDate: todayStr }
    });
    
    const allApps = response.data || [];

    const clinicApps = allApps.filter((a: any) => {
        const appTenantId = a.tenant?.id || a.doctor?.tenant?.id;
        if (currentTenantId && appTenantId && appTenantId !== currentTenantId) return false;
        
        const appDate = new Date(a.startTime);
        const isSameDay = appDate.getDate() === today.getDate() && appDate.getMonth() === today.getMonth();
        return isSameDay && a.status !== 'cancelled';
    });
    
    let relevantApps = clinicApps;
    const isDoctorOrAdmin = user.role === 'dentist' || user.role === 'admin';

    if (isDoctorOrAdmin) {
        relevantApps = clinicApps.filter((a: any) => a.doctor?.id === user.id);
    }

    if (relevantApps.length === 0) return null; 

    const totalToday = relevantApps.length; 
    
    const now = new Date();
    const upcomingApps = relevantApps.filter((a: any) => {
        const t = new Date(a.startTime);
        return t > now && a.status !== 'completed';
    }).sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    if (upcomingApps.length > 0) {
        const nextApp = upcomingApps[0];
        const pName = nextApp.patient?.fullName || 'Paciente';
        const time = new Date(nextApp.startTime).toLocaleTimeString('es-PE', {hour:'2-digit', minute:'2-digit'});
        
        let msg = '';
        if (isDoctorOrAdmin) {
            msg = `Dr(a), hoy tiene <strong>${totalToday} pacientes</strong>. Sigue: <strong>${pName}</strong> a las ${time}.`;
        } else {
            const docName = nextApp.doctor?.fullName.split(' ')[0] || '';
            msg = `Hoy hay <strong>${totalToday} citas</strong>. Sigue: <strong>${pName}</strong> (${docName}) a las ${time}.`;
        }
        
        if (!silent) speak(msg, 'info', '/appointments');
        return { text: msg, type: 'info', route: '/appointments' };

    } else {
        const msg = `✅ ¡Excelente! Agenda de hoy completada.`;
        if (!silent) speak(msg, 'success', '/appointments');
        return { text: msg, type: 'success', route: '/appointments' };
    }

  } catch (e) {
    console.error(e);
  }
  return null;
};

// 3. CITAS PLANIFICADAS EN HISTORIAL
const checkFollowUpReminders = async (userRole: string | undefined, userId: string | undefined, silent = false): Promise<AssistantAlert | null> => {
    if (!userId) return null;

    try {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const [resToday, resTomorrow] = await Promise.allSettled([
            apiClient.get('/clinical-history/reminders', { params: { date: todayStr } }),
            apiClient.get('/clinical-history/reminders', { params: { date: tomorrowStr } })
        ]);

        const entriesToday = resToday.status === 'fulfilled' ? resToday.value.data || [] : [];
        const entriesTomorrow = resTomorrow.status === 'fulfilled' ? resTomorrow.value.data || [] : [];

        const filterRelevant = (entry: any) => {
            const docId = entry.user?.id || entry.userId;
            return (userRole === 'admin' || userRole === 'assistant' || docId === userId);
        };

        const relevantToday = entriesToday.filter(filterRelevant);
        const relevantTomorrow = entriesTomorrow.filter(filterRelevant);

        // Prioridad Hoy
        if (relevantToday.length > 0) {
            const entry = relevantToday[0]; 
            const pName = entry.patient?.fullName || 'un paciente';
            const plan = entry.nextAppointmentPlan || 'Control';
            const msg = `🚨 <strong>Planificación Hoy:</strong> Ver a <strong>${pName}</strong> por "${plan}". ¿Vino?`;
            
            if (!silent) speak(msg, 'warning', `/patients/${entry.patient?.id}`);
            return { text: msg, type: 'warning', route: `/patients/${entry.patient?.id}` };
        }

        // Prioridad Mañana
        if (relevantTomorrow.length > 0) {
            const entry = relevantTomorrow[0];
            const pName = entry.patient?.fullName || 'un paciente';
            const plan = entry.nextAppointmentPlan || 'Control';
            const msg = `📋 <strong>Planificación Mañana:</strong> Toca seguimiento con <strong>${pName}</strong> ("${plan}").`;

            if (!silent) speak(msg, 'info', `/patients/${entry.patient?.id}`);
            return { text: msg, type: 'info', route: `/patients/${entry.patient?.id}` };
        }

    } catch (e) {
        // Silencioso
    }
    return null;
};

// 4. ALERTA DE CITA PRÓXIMA (Agenda Hoy - Inminente)
const checkUpcomingAppointments = (role: string | undefined, userId: string | undefined, silent = false): AssistantAlert | null => {
  const now = new Date();
  const next30Minutes = new Date(now.getTime() + 30 * 60000); 

  // Casting seguro
  const appsList = (appointments as any)?.value || [];

  const upcoming = appsList.find((app: any) => {
    const appTime = new Date(app.startTime);
    const isRelevant = (role === 'dentist' || role === 'admin') ? app.doctor?.id === userId : true;
    return isRelevant && appTime > now && appTime <= next30Minutes && app.status !== 'cancelled' && app.status !== 'completed';
  });

  if (upcoming) {
    const appAny = upcoming as any;
    const timeString = new Date(appAny.startTime).toLocaleTimeString('es-PE', {hour:'2-digit', minute:'2-digit'});
    const pName = appAny.patient?.fullName || 'Paciente';
    const dName = appAny.doctor?.fullName;
    
    let msg = '';
    if (role === 'dentist' || role === 'admin') {
        msg = `🔔 <strong>¡Ahora!</strong> Cita con <strong>${pName}</strong> a las ${timeString}.`;
    } else {
        const doctorText = dName ? ` con Dr. ${dName}` : '';
        msg = `🔔 <strong>Atención:</strong> Paciente <strong>${pName}</strong>${doctorText} (${timeString}).`;
    }

    if (!silent) speak(msg, 'warning', `/appointments`);
    return { text: msg, type: 'warning', route: '/appointments' };
  }
  return null;
};

// --- MANEJADOR DE CLIC MANUAL (ROTACIÓN) ---
const handleManualCheck = async () => {
    const userRole = authStore.user?.role;
    const userId = authStore.user?.id;
    const alerts: AssistantAlert[] = [];

    // Recolectamos todas las alertas posibles sin hablar (silent=true)
    const urgent = checkUpcomingAppointments(userRole, userId, true);
    if (urgent) alerts.push(urgent);

    const today = await checkTodayLogistics(true);
    if (today) alerts.push(today);

    const followUp = await checkFollowUpReminders(userRole, userId, true);
    if (followUp) alerts.push(followUp);

    const tomorrow = await checkTomorrowLogistics(true);
    if (tomorrow) alerts.push(tomorrow);

    // LÓGICA DE ROTACIÓN
    if (alerts.length > 0) {
        // Aseguramos que el índice no se salga del rango
        if (manualAlertIndex >= alerts.length) {
            manualAlertIndex = 0;
        }

        const alertToShow = alerts[manualAlertIndex];
        speak(alertToShow.text, alertToShow.type, alertToShow.route);
        
        // Preparamos el índice para el siguiente clic
        manualAlertIndex++;
    } else {
        // Mensaje de estado si no hay alertas
        const hour = new Date().getHours();
        if (hour >= 19) {
            speak("Todo en orden por hoy. ¡Que tenga un buen descanso! 🌙", "success");
        } else {
            speak("No hay alertas pendientes por el momento. ¡Todo bajo control! ✅", "success");
        }
    }
};

// --- CEREBRO AUTOMÁTICO (CICLO DE FONDO) ---
const runAssistantRoutine = () => {
  cycleCount++;

  if (cycleCount % 4 === 0) {
      showRandomTip();
  } else if (cycleCount % 3 === 0) {
      checkFollowUpReminders(authStore.user?.role, authStore.user?.id);
  } else if (cycleCount % 2 === 0) {
      checkTomorrowLogistics();
  } else {
      checkTodayLogistics();
  }
};

onMounted(async () => {
  const user = authStore.user;
  
  const today = new Date().toISOString().split('T')[0];
  if ((appointmentsStore as any).fetchAppointments) {
      await (appointmentsStore as any).fetchAppointments(today, today); 
  }
  
  if (authStore.user?.role === 'assistant' || authStore.user?.role === 'admin') {
      appointmentsStore.fetchNextDayPending();
  }

  if (user) {
    const firstName = user.fullName.split(' ')[0];
    const hour = new Date().getHours();
    const greetingTime = hour < 12 ? 'Buenos días' : (hour < 19 ? 'Buenas tardes' : 'Buenas noches');
    const roleText = (user.role === 'dentist' || user.role === 'admin') ? 'Dr(a).' : '';

    setTimeout(() => {
        speak(`¡${greetingTime} ${roleText} ${firstName}! Muelín a sus servicios.`, 'success');
    }, 1500);

    // Iniciar ciclo automático
    assistantInterval = window.setInterval(runAssistantRoutine, 300000); // 5 minutos
  }
});

onUnmounted(() => {
  if (assistantInterval) clearInterval(assistantInterval);
});

const bubbleColorClass = computed(() => {
  if (alertType.value === 'warning') return 'bg-yellow-50 border-yellow-200 text-yellow-900';
  if (alertType.value === 'success') return 'bg-green-50 border-green-200 text-green-900';
  return 'bg-white border-blue-200 text-slate-700';
});
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
    
    <!-- GLOBO DE DIÁLOGO -->
    <Transition name="bounce">
      <div 
        v-if="showBubble" 
        @click="handleBubbleClick"
        class="mb-4 mr-5 p-4 rounded-2xl rounded-br-sm shadow-xl border-2 cursor-pointer max-w-[300px] relative bubble-triangle transform transition-all hover:scale-105 pointer-events-auto bg-opacity-95 backdrop-blur-sm"
        :class="bubbleColorClass"
      >
        <button 
          @click.stop="showBubble = false" 
          class="absolute -top-2 -left-2 bg-white hover:bg-gray-100 rounded-full p-1.5 text-gray-400 border border-gray-200 shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
        
        <div class="flex gap-3 items-start">
           <div class="text-2xl pt-0.5">
             <span v-if="alertType === 'warning'">⏰</span>
             <span v-else-if="alertType === 'success'">👋</span>
             <span v-else>💡</span>
           </div>
           <div>
             <p class="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Muelín Dice:</p>
             <!-- Mensaje con HTML permitido para listas y negritas -->
             <p class="text-sm font-medium leading-snug" v-html="message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')"></p>
             
             <p v-if="targetRoute" class="text-[10px] text-blue-600 font-bold mt-2 hover:underline">
                Click para ver detalles &rarr;
             </p>
           </div>
        </div>
      </div>
    </Transition>

    <!-- PERSONAJE (CLICKABLE) -->
    <div 
      class="w-24 h-24 cursor-pointer hover:-translate-y-1 transition-transform duration-300 drop-shadow-2xl pointer-events-auto relative"
      @click="handleManualCheck" 
      title="Click para ver consejos o alertas"
    >
      <div class="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="relative z-10 w-full h-full">
        <defs>
           <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
             <feGaussianBlur stdDeviation="4" result="blur"/>
             <feComposite in="SourceGraphic" in2="blur" operator="over"/>
           </filter>
        </defs>
        
        <path d="M50 40 Q20 40 20 80 Q20 130 50 160 Q60 170 60 190 L80 170 L120 170 L140 190 Q140 170 150 160 Q180 130 180 80 Q180 40 150 40 Q100 20 50 40 Z" fill="white" stroke="#3b82f6" stroke-width="5" filter="url(#glow)"/>
        <circle cx="70" cy="95" r="8" fill="#1e293b"><animate attributeName="ry" values="8;0.5;8" dur="4s" repeatCount="indefinite" /></circle>
        <circle cx="130" cy="95" r="8" fill="#1e293b"><animate attributeName="ry" values="8;0.5;8" dur="4s" repeatCount="indefinite" /></circle>
        <circle cx="55" cy="110" r="7" fill="#fca5a5" opacity="0.6"/>
        <circle cx="145" cy="110" r="7" fill="#fca5a5" opacity="0.6"/>
        <path d="M85 115 Q100 125 115 115" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
        <path d="M60 45 L140 45 L130 20 L70 20 Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
        <rect x="92" y="25" width="16" height="16" fill="#ef4444" rx="2" />
        <rect x="98" y="22" width="4" height="22" fill="white" />
        <rect x="89" y="31" width="22" height="4" fill="white" />
        <ellipse cx="150" cy="60" rx="8" ry="4" fill="white" opacity="0.9" transform="rotate(-45 150 60)"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.bounce-enter-active { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.bounce-leave-active { animation: bounce-out 0.3s ease-in; }
@keyframes bounce-in { 0% { transform: scale(0.5) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
@keyframes bounce-out { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.8) translateY(10px); opacity: 0; } }

.bubble-triangle::after {
  content: '';
  position: absolute;
  bottom: -10px; 
  right: 40px; 
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 0px solid transparent;
  border-top: 15px solid;
  border-top-color: inherit;
  border-top-color: white; 
}
.bg-yellow-50.bubble-triangle::after { border-top-color: #fefce8; border-right: 1px solid #fef08a; }
.bg-green-50.bubble-triangle::after { border-top-color: #f0fdf4; border-right: 1px solid #bbf7d0; }
.bg-white.bubble-triangle::after { border-top-color: #ffffff; border-right: 1px solid #bfdbfe; }
</style>