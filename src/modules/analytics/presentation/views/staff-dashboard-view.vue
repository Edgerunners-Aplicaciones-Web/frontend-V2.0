<template>
  <div class="staff-dashboard">
    <pv-toast position="bottom-right" />
    <pv-menu ref="menu" :model="menuItems" :popup="true" />

    <pv-toolbar class="staff-toolbar">
      <template #start>
        <pv-button icon="pi pi-bars" class="p-button-secondary mr-2" @click="toggleMenu" />
        <h1 class="toolbar-title">{{ t('staffDashboard.title') }}</h1>
      </template>
      <template #end>
        <LanguageSwitcher class="mr-2" />
        <pv-button :label="t('dashboard.logoutButton')" icon="pi pi-sign-out" class="p-button-danger" @click="logout" />
      </template>
    </pv-toolbar>

    <div class="p-4 dashboard-content">

      <div class="grid mb-4">
        <div class="col-12 md:col-8">
          <h2 class="text-2xl font-bold">{{ t('staffDashboard.welcome', { name: staffProfile.name }) }}</h2>
          <p class="text-lg text-color-secondary">{{ staffProfile.position || 'Staff' }} | {{ t('staffDashboard.shift') }}: {{ staffProfile.shift || 'N/A' }}</p>
        </div>
        <div class="col-12 md:col-4">
          <pv-card class="quick-actions-card">
            <template #title>{{ t('staffDashboard.quickActions') }}</template>
            <template #content>
              <div class="flex flex-wrap gap-2 justify-center">
                <pv-button :label="t('staffDashboard.reportIssue')" icon="pi pi-exclamation-triangle" class="p-button-warning" @click="reportIssue" />
                <pv-button :label="t('staffDashboard.requestSupplies')" icon="pi pi-box" class="p-button-info" @click="requestSupplies" />
              </div>
            </template>
          </pv-card>
        </div>
      </div>

      <div class="grid mb-4">
        <div class="col-12">
          <pv-card>
            <template #title>
              <div class="flex flex-col sm:flex-row justify-between items-center">
                <span class="text-xl font-semibold mb-2 sm:mb-0">{{ t('staffDashboard.performanceStats') }}</span>
                <pv-select-button v-model="statsPeriod" :options="statsPeriodOptions" optionLabel="label" optionValue="value" :allowEmpty="false" />
              </div>
            </template>
            <template #content>
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
                <pv-chart type="bar" :data="analyticsStore.staffStats.chartData" :options="chartOptions" />
              </div>
            </template>
          </pv-card>
        </div>
      </div>

      <div class="grid">
        <div class="col-12 md:col-7">
          <pv-card>
            <template #title>
              <div class="flex justify-between items-center">
                <span>{{ t('staffDashboard.pendingTasks') }}</span>
                <pv-button :label="t('staffDashboard.viewAllTasks')" class="p-button-text" @click="goToTasks" />
              </div>
            </template>
            <template #content>
              <pv-data-table :value="pendingTasks" :loading="propertyStore.loading" class="p-datatable-sm" :rows="5" responsiveLayout="scroll">

                <pv-column headerStyle="width: 4rem" bodyClass="text-center">
                  <template #body="slotProps">
                    <pv-checkbox
                        v-model="slotProps.data.isCompleted"
                        :binary="true"
                        @change="toggleDashboardTask(slotProps.data)"
                    />
                  </template>
                </pv-column>

                <pv-column field="description" :header="t('staffDashboard.taskDescription')"></pv-column>
                <pv-column field="roomId" :header="t('staffDashboard.taskRoom')">
                  <template #body="slotProps">
                    {{ getRoomNumber(slotProps.data.roomId) }}
                  </template>
                </pv-column>
                <pv-column field="status" :header="t('staffDashboard.taskStatus')">
                  <template #body="slotProps">
                    <pv-tag :severity="getStatusSeverity(slotProps.data.status)" :value="t(`taskStatus.${slotProps.data.status.toLowerCase()}`)" />
                  </template>
                </pv-column>

                <template #empty>{{ t('staffDashboard.noPendingTasks') }}</template>
                <template #loading>{{ t('common.loading') }}</template>
              </pv-data-table>
            </template>
          </pv-card>
        </div>

        <div class="col-12 md:col-5">
          <pv-card>
            <template #title>
              <div class="flex justify-between items-center">
                <span>{{ t('staffDashboard.assignedRooms') }}</span>
                <pv-button :label="t('staffDashboard.viewAllRooms')" class="p-button-text" @click="goToRooms" />
              </div>
            </template>
            <template #content>
              <pv-data-table :value="assignedRooms" :loading="propertyStore.loading" class="p-datatable-sm" :rows="5" responsiveLayout="scroll">
                <pv-column field="number" :header="t('staffDashboard.roomNumber')"></pv-column>
                <pv-column field="status" :header="t('staffDashboard.taskStatus')">
                  <template #body="slotProps">
                    <pv-tag :severity="getStatusSeverity(slotProps.data.status)" :value="t(`roomStatus.${slotProps.data.status.toLowerCase()}`)" />
                  </template>
                </pv-column>
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
import { ref, onMounted, computed, onActivated, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from "primevue/usetoast";

// --- Importa componentes PrimeVue (idéntico a v1) ---
import PvToolbar from 'primevue/toolbar';
import PvButton from 'primevue/button';
import PvMenu from 'primevue/menu';
import PvCard from 'primevue/card';
import PvDataTable from 'primevue/datatable';
import PvColumn from 'primevue/column';
import PvTag from 'primevue/tag';
import PvChart from 'primevue/chart';
import PvToast from 'primevue/toast';
import PvCheckbox from 'primevue/checkbox';
import PvSelectButton from 'primevue/selectbutton';
import Tooltip from 'primevue/tooltip';
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue';

// --- Importa los DOS STORES ---
import { useAnalyticsStore } from '../../application/store/analytics.store.js'; // Ruta Corregida
import { usePropertyStore } from '../../../property/application/store/property.store.js'; // Ruta Corregida

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
const statsPeriod = ref('week');

// --- Configuraciones (idéntico a v1) ---
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  plugins: { legend: { display: false } }
});
const menuItems = computed(() => [ // Convertido a computed
  { label: t('menu.profile'), icon: 'pi pi-user', command: () => goToProfile() },
  { label: t('menu.tasks'), icon: 'pi pi-check-square', command: () => goToTasks() },
  { label: t('menu.assignedRooms'), icon: 'pi pi-key', command: () => goToRooms() },
]);
const statsPeriodOptions = computed(() => [
  { label: t('tasks.filterToday'), value: 'today' },
  { label: t('tasks.filterWeek'), value: 'week' },
  { label: t('tasks.filterMonth'), value: 'month' },
  { label: t('tasks.filterYear'), value: 'year' }
]);

// --- Lógica de Carga (Llama a AMBOS stores) ---
async function loadDashboardData() {

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
    ]);

    // Simulación de carga de perfil (reemplazar con IAM.store)
    const storedUserParsed = JSON.parse(storedUser);
    staffProfile.value.name = storedUserParsed.name || 'Staff';
    // (Aquí faltaría 'position' y 'shift', que deben venir de IAM.store)

  } catch (error) {
    console.error("Error loading staff dashboard:", error);
    toast.add({ severity: 'error', summary: t('errors.fetchError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  } finally {
    analyticsStore.loading = false;
    propertyStore.loading = false;
  }
}

onMounted(loadDashboardData);
onActivated(loadDashboardData);
watch(statsPeriod, loadDashboardData);

// --- Propiedades Computadas (Usan datos de los Stores) ---

// Tareas Pendientes (usa propertyStore)
const pendingTasks = computed(() => { // Nombre corregido
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

function toggleMenu(event) { menu.value.toggle(event); }
function logout() {
  localStorage.clear();
  router.push({ name: 'login' });
}
function reportIssue() { toast.add({ severity: 'info', summary: t('staffDashboard.issueReported'), detail: t('staffDashboard.notifyMaintenance'), life: 3000 }); }
function requestSupplies() { toast.add({ severity: 'info', summary: t('staffDashboard.suppliesRequested'), detail: t('staffDashboard.notifyHousekeeping'), life: 3000 }); }
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
    // (No implementamos desmarcar aquí)
  } catch (error) {
    taskData.isCompleted = false; // Revierte el check
    console.error("Error completing task from dashboard:", error);
    toast.add({ severity: 'error', summary: t('errors.taskError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  }
}

// --- Helpers Visuales (idéntico a v1) ---
function getStatusSeverity(status) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'available': return 'success';
    case 'occupied': return 'danger';
    case 'cleaning': return 'info';
    case 'maintenance': return 'warning';
    case 'pendiente': return 'warning';
    case 'en proceso': return 'info';
    case 'completada': return 'success';
    case 'por limpiar': return 'info';
    case 'revisión pendiente': return 'warning';
    default: return 'secondary';
  }
}
const vTooltip = Tooltip;
</script>

<style scoped>
/* (Estilos idénticos a v1) */
.staff-toolbar {
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}
.toolbar-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}
.quick-actions-card .p-card-body,
.time-clock-card .p-card-body {
  padding: 1rem;
}
.quick-actions-card .p-card-content,
.time-clock-card .p-card-content {
  padding: 0.5rem 0 0 0;
}
.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
}
.stat-label {
  font-size: 1rem;
  color: var(--text-color-secondary);
}
.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}
:deep(.p-chart) {
  height: 250px;
}
</style>