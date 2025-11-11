<template>
  <div class="staff-dashboard">
    <pv-toast position="bottom-right" />
    <pv-menu ref="menu" :model="menuItems" :popup="true" />

    <!-- ... (Toolbar idéntica a v1) ... -->

    <div class="p-4 dashboard-content">

      <!-- ... (Bienvenida idéntica a v1, usa 'staffProfile' local) ... -->
      <!-- ... (Quick Actions idéntica a v1) ... -->

      <!-- Estadísticas (AHORA USA 'analyticsStore') -->
      <div class="grid mb-4">
        <div class="col-12">
          <pv-card>
            <template #title>
              <div class="flex ... justify-between items-center">
                <span class="text-xl font-semibold ...">{{ t('staffDashboard.performanceStats') }}</span>
                <pv-select-button v-model="statsPeriod" :options="statsPeriodOptions" ... />
              </div>
            </template>
            <template #content>
              <!-- AQUI EL CAMBIO -->
              <div class="grid text-center">
                <div class="col-6 md:col-3">
                  <div class="stat-value">{{ analyticsStore.staffStats.kpi.daily }}</div>
                  <div class="stat-label">{{ t('staffDashboard.tasksToday') }}</div>
                </div>
                <div class="col-6 md:col-3">
                  <div class="stat-value">{{ analyticsStore.staffStats.kpi.weekly }}</div>
                  <div class="stat-label">{{ t('staffDashboard.tasksThisWeek') }}</div>
                </div>
                <div class="col-6 md:col-3">
                  <div class="stat-value">{{ analyticsStore.staffStats.kpi.monthly }}</div>
                  <div class="stat-label">{{ t('staffDashboard.tasksThisMonth') }}</div>
                </div>
                <div class="col-6 md:col-3">
                  <div class="stat-value">{{ analyticsStore.staffStats.kpi.yearly }}</div>
                  <div class="stat-label">{{ t('staffDashboard.tasksThisYear') }}</div>
                </div>
              </div>
              <div class="mt-4">
                <!-- AQUI EL CAMBIO -->
                <pv-chart type="bar" :data="analyticsStore.staffStats.chartData" :options="chartOptions" />
              </div>
            </template>
          </pv-card>
        </div>
      </div>

      <!-- Tareas y Cuartos (AHORA USA 'propertyStore') -->
      <div class="grid">
        <div class="col-12 md:col-7">
          <pv-card>
            <!-- ... (Título del Card) ... -->
            <template #content>
              <!-- AQUI EL CAMBIO -->
              <pv-data-table :value="pendingTasks" :loading="propertyStore.loading" ...>
                <!-- ... (Columnas idénticas, pero 'getRoomNumber' usa datos de 'propertyStore') ... -->
                <pv-column field="roomId" :header="t('staffDashboard.taskRoom')">
                  <template #body="slotProps">
                    {{ getRoomNumber(slotProps.data.roomId) }}
                  </template>
                </pv-column>
                <!-- ... -->
                <template #empty>{{ t('staffDashboard.noPendingTasks') }}</template>
                <template #loading>{{ t('common.loading') }}</template>
              </pv-data-table>
            </template>
          </pv-card>
        </div>

        <div class="col-12 md:col-5">
          <pv-card>
            <!-- ... (Título del Card) ... -->
            <template #content>
              <!-- AQUI EL CAMBIO -->
              <pv-data-table :value="assignedRooms" :loading="propertyStore.loading" ...>
                <!-- ... (Columnas idénticas) ... -->
                <template #empty>{{ t('staffDashboard.noAssignedRooms') }}</template>
                <template #loading>{{ t('common.loading') }}</template>
              </pv-data-table>
            </template>
          </pv-card>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// (Movido y refactorizado desde v1 'StaffDashboard.vue')
import { ref, onMounted, computed, onActivated, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from "primevue/usetoast";

// --- Importa componentes PrimeVue (idéntico a v1) ---
// ...
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue';
import PvCheckbox from 'primevue/checkbox';
import PvSelectButton from 'primevue/selectbutton';
import PvChart from 'primevue/chart';
import Tooltip from 'primevue/tooltip';
// ...

// --- Importa los DOS STORES ---
import { useAnalyticsStore } from '../../application/Analytics.store.js';
import { usePropertyStore } from '../../../property/application/Property.store.js';
// (Ya no necesitamos importar servicios/repositorios aquí)

// --- Inicializa hooks ---
const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const menu = ref();

// --- Instancia STORES ---
const analyticsStore = useAnalyticsStore();
const propertyStore = usePropertyStore();

// --- Estado LOCAL de la Vista ---
const staffId = ref(null);
const staffProfile = ref({ name: 'Staff', position: '', shift: '' });
// const allTasks = ref([]); // <-- Ahora en propertyStore.tasks
// const rooms = ref([]); // <-- Ahora en propertyStore.rooms
// const stats = ref({ ... }); // <-- Ahora en analyticsStore.staffStats
// const assignedRooms = ref([]); // <-- Se calculará en 'computeds'
// const loading = ref(true); // <-- Usaremos store.loading
const statsPeriod = ref('week');

// --- Configuraciones (idéntico a v1) ---
const chartOptions = ref({ /* ... */ });
const menuItems = computed(() => [ // Convertido a computed
  { label: t('menu.profile'), icon: 'pi pi-user', command: () => goToProfile() },
  { label: t('menu.tasks'), icon: 'pi pi-check-square', command: () => goToTasks() },
  { label: t('menu.assignedRooms'), icon: 'pi pi-key', command: () => goToRooms() },
]);
const statsPeriodOptions = computed(() => [ /* ... */ ]);

// --- Lógica de Carga (Llama a AMBOS stores) ---
async function loadDashboardData() {
  // Usamos el 'loading' de CADA store
  analyticsStore.loading = true;
  propertyStore.loading = true;
  console.log("Refreshing dashboard data for period:", statsPeriod.value);
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) throw new Error("User not found in localStorage.");
    staffId.value = JSON.parse(storedUser).id;

    // Ejecuta AMBAS cargas en paralelo
    await Promise.all([
      analyticsStore.fetchStaffStats(staffId.value, statsPeriod.value, t),
      propertyStore.fetchStaffData(staffId.value),
      // (La lógica de 'profileDetails' de v1 ahora debe venir del IAM store)
      // Por ahora, la dejamos simulada
      // const profileDetails = await iamStore.getStaffDetail(staffId.value);
      // staffProfile.value = profileDetails;
    ]);

    // Simulación de carga de perfil (reemplazar con IAM.store)
    const storedUserParsed = JSON.parse(storedUser);
    staffProfile.value.name = storedUserParsed.name || 'Staff';


  } catch (error) {
    console.error("Error loading staff dashboard:", error);
    toast.add({ severity: 'error', summary: t('errors.fetchError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  } finally {
    analyticsStore.loading = false;
    propertyStore.loading = false;
  }
}

// --- Hooks de Ciclo de Vida (idéntico a v1) ---
onMounted(loadDashboardData);
onActivated(loadDashboardData);
watch(statsPeriod, loadDashboardData);

// --- Propiedades Computadas (Usan datos de los Stores) ---

// Tareas Pendientes (usa propertyStore)
const pendingTasksWithStatus = computed(() => {
  return propertyStore.tasks
      .filter(t => t.status.toLowerCase() === 'pendiente' || t.status.toLowerCase() === 'en proceso')
      .map(t => ({
        ...t,
        isCompleted: false
      }))
      .slice(0, 5);
});

// Cuartos Asignados (usa propertyStore)
const assignedRooms = computed(() => {
  // Lógica de v1 'getAssignedRoomsForStaff'
  return propertyStore.rooms
      .filter(room => room.status === 'Por limpiar' || room.status === 'Revisión pendiente' || room.status === 'cleaning')
      .slice(0, 5); // Limita a 5
});


// --- Métodos (Llaman a los Stores) ---
function getRoomNumber(roomId) {
  const room = propertyStore.rooms.find(r => r.id === roomId); // Usa propertyStore
  return room ? room.number : `ID: ${roomId}`;
}

function toggleMenu(event) { /* ... (idéntico a v1) ... */ }
function logout() { /* ... (idéntico a v1) ... */ }
function reportIssue() { /* ... (idéntico a v1) ... */ }
function requestSupplies() { /* ... (idéntico a v1) ... */ }
function goToProfile() { /* router.push({ name: 'staff-profile' }); */ }
function goToTasks() { router.push({ name: 'staff-task-list' }); }
function goToRooms() { router.push({ name: 'staff-room-cleaning' }); }

async function toggleDashboardTask(taskData) {
  try {
    if (taskData.isCompleted) {
      // Llama a la acción del store de Property
      await propertyStore.updateTaskStatus(taskData.id, 'Completada', staffId.value);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('staffDashboard.taskCompleted'), life: 3000 });
      // Recarga AMBOS stores
      await loadDashboardData();
    }
  } catch (error) {
    taskData.isCompleted = false; // Revierte el check
    console.error("Error completing task from dashboard:", error);
    toast.add({ severity: 'error', summary: t('errors.taskError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  }
}

// --- Helpers Visuales (idéntico a v1) ---
function getStatusSeverity(status) { /* ... */ }
const vTooltip = Tooltip;
</script>

<style scoped>
/* (Estilos idénticos a v1) */
.staff-toolbar { /* ... */ }
/* ... */
</style>