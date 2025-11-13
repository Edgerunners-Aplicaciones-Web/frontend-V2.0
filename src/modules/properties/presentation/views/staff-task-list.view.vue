<template>
  <div class="task-list-page">
    <pv-toast />
    <pv-confirm-dialog />

    <pv-toolbar class="mb-4">
      <template #start>
        <pv-button :label="t('common.back')" icon="pi pi-arrow-left" class="p-button-secondary mr-2" @click="goBack" />
        <pv-button :label="t('tasks.newTask')" icon="pi pi-plus" class="p-button-success" @click="openNew" />
      </template>
      <template #end>
        <LanguageSwitcher />
      </template>
    </pv-toolbar>

    <div class="card mb-4">
      <div class="flex justify-center">
        <pv-select-button v-model="statusFilter" :options="filterOptions" optionLabel="label" optionValue="value" :allowEmpty="false" />
      </div>
    </div>

    <div class="card">
      <pv-data-table
          :value="filteredTasks"
      :loading="store.loading"
      paginator :rows="10" responsiveLayout="scroll"
      >
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-xl m-0">{{ t('tasks.title') }}</h3>
        </div>
      </template>

      <pv-column header="" headerStyle="width: 4rem" bodyClass="text-center">
        <template #body="slotProps">
          <pv-checkbox
              v-model="slotProps.data.isCompleted"
              :binary="true"
              @change="toggleTaskCompletion(slotProps.data)"
              :disabled="slotProps.data.status === 'Completada'"
          />
        </template>
      </pv-column>

      <pv-column field="description" :header="t('staffDashboard.taskDescription')" sortable style="min-width: 16rem"></pv-column>

      <pv-column field="roomId" :header="t('staffDashboard.taskRoom')" sortable>
        <template #body="slotProps">
          <!-- Usa computada local 'getRoomNumber' -->
          {{ getRoomNumber(slotProps.data.roomId) }}
        </template>
      </pv-column>

      <pv-column field="status" :header="t('staffDashboard.taskStatus')" sortable>
        <template #body="slotProps">
          <pv-tag :severity="getStatusSeverity(slotProps.data.status)" :value="t(`taskStatus.${slotProps.data.status.toLowerCase()}`)" />
        </template>
      </pv-column>

      <pv-column field="createdAt" :header="t('tasks.created')" sortable>
        <template #body="slotProps">
          {{ formatDateTime(slotProps.data.createdAt) }}
        </template>
      </pv-column>

      <pv-column :header="t('common.actions')" :exportable="false" style="min-width: 8rem">
        <template #body="slotProps">
          <pv-button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-warning p-button-text mr-2"
              @click="editTask(slotProps.data)"
              v-tooltip.top="t('common.edit')"
          />
          <pv-button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger p-button-text"
              @click="confirmDeleteTask(slotProps.data)"
              v-tooltip.top="t('common.delete')"
          />
        </template>
      </pv-column>

      <template #empty>{{ t('tasks.noTasksFound') }}</template>
      <template #loading>{{ t('common.loading') }}</template>
      </pv-data-table>
    </div>

    <pv-dialog v-model:visible="taskDialog" :style="{width: '450px'}" :header="t('tasks.taskDetails')" :modal="true" class="p-fluid">
      <div class="field">
        <label for="description">{{ t('staffDashboard.taskDescription') }}</label>
        <pv-textarea id="description" v-model.trim="task.description" required="true" rows="3" :class="{'p-invalid': submitted && !task.description}" />
        <small class="p-error" v-if="submitted && !task.description">{{ t('errors.descriptionRequired') }}</small>
      </div>

      <div class="field">
        <label for="roomId">{{ t('staffDashboard.taskRoom') }}</label>
        <pv-select
            id="roomId"
            v-model="task.roomId"
            :options="roomOptions"
        optionLabel="label"
        optionValue="value"
        :placeholder="t('tasks.selectRoomPlaceholder')"
        filter
        required="true"
        :class="{'p-invalid': submitted && !task.roomId}"
        />
        <small class="p-error" v-if="submitted && !task.roomId">{{ t('tasks.roomRequired') }}</small>
      </div>

      <div class="field">
        <label for="status">{{ t('staffDashboard.taskStatus') }}</label>
        <pv-select id="status" v-model="task.status" :options="statusOptions" optionLabel="label" optionValue="value" :placeholder="t('tasks.selectStatus')" />
      </div>
      <template #footer>
        <pv-button :label="t('common.cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
        <!-- 'saving' ahora es 'store.loading' -->
        <pv-button :label="t('common.save')" icon="pi pi-check" @click="saveTask" :loading="store.loading" />
      </template>
    </pv-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

// --- Importar componentes PrimeVue (idéntico a tu v1) ---
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue';
import PvToolbar from 'primevue/toolbar';
import PvDataTable from 'primevue/datatable';
import PvColumn from 'primevue/column';
import PvButton from 'primevue/button';
import PvTag from 'primevue/tag';
import PvDialog from 'primevue/dialog';
import PvTextarea from 'primevue/textarea';
import PvSelect from 'primevue/select';
import PvSelectButton from 'primevue/selectbutton';
import PvToast from 'primevue/toast';
import PvConfirmDialog from 'primevue/confirmdialog';
import PvCheckbox from 'primevue/checkbox';
import Tooltip from 'primevue/tooltip';

// --- Importar el STORE ---
import { usePropertyStore } from '../../application/store/property.store.js';

import { PropertyApiRepository } from '../../infrastructure/repositories/property-api.repository.js';


// Hooks
const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const vTooltip = Tooltip;

// --- Instancia STORE y Repo ---
const store = usePropertyStore();
const propertyRepository = new PropertyApiRepository(); // Para las acciones de v1

// --- Estado LOCAL de la Vista (Formulario, Filtros) ---
const staffId = ref(null);
const taskDialog = ref(false);
const task = ref({});
const submitted = ref(false);
const statusFilter = ref('Pendiente'); // Filtro local

// --- Opciones Computadas (Usan datos del Store) ---
const statusOptions = computed(() => [
  { label: t('taskStatus.pendiente'), value: 'Pendiente' },
  { label: t('taskStatus.en_proceso'), value: 'En proceso' },
  { label: t('taskStatus.completada'), value: 'Completada' }
]);

const roomOptions = computed(() => {
  return store.rooms.map(room => ({ // Usa store.rooms
    label: `${t('tasks.roomLabel')} ${room.number} (${room.type || 'N/A'})`,
    value: room.id
  }));
});

const filterOptions = computed(() => [
  { label: t('tasks.filterAll'), value: 'All' },
  { label: t('tasks.filterPending'), value: 'Pendiente' },
  { label: t('tasks.filterInProgress'), value: 'En proceso' },
  { label: t('tasks.filterCompleted'), value: 'Completada' }
]);

// Propiedad Computada para añadir 'isCompleted' (Usa store.tasks)
const tasksWithStatus = computed(() => {
  return store.tasks.map(t => ({ // Usa store.tasks
    ...t,
    isCompleted: t.status.toLowerCase() === 'completada'
  }));
});

// Propiedad Computada para filtrar tareas
const filteredTasks = computed(() => {
  const tasks = tasksWithStatus.value;
  if (!statusFilter.value || statusFilter.value === 'All') {
    return tasks;
  }
  const filter = statusFilter.value.toLowerCase();
  return tasks.filter(t => t.status.toLowerCase() === filter);
});

// --- Carga Inicial (Llama al Store) ---
onMounted(async () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) throw new Error("User not found in localStorage.");
    staffId.value = JSON.parse(storedUser).id;

    // Llama a la acción del store
    await store.fetchStaffData(staffId.value);
    console.log('StaffTaskList: Datos cargados desde el store (Tasks & Rooms)');

  } catch (error) {
    console.error("Error on mount (Vista):", error);
    toast.add({ severity: 'error', summary: t('errors.authError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  }
});

// Función para recargar (Llama al Store)
async function loadTasks() {
  try {
    await store.fetchStaffData(staffId.value);
  } catch (error) {
    console.error("Error fetching tasks (Vista):", error);
    toast.add({ severity: 'error', summary: t('errors.fetchError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  }
}

// Navegación
function goBack() {
  router.push('/staff/dashboard');
}

// --- Lógica del CRUD (Llama al Store o Repo v1) ---

function openNew() {
  task.value = { status: 'Pendiente' };
  submitted.value = false;
  taskDialog.value = true;
}
function hideDialog() {
  taskDialog.value = false;
  submitted.value = false;
}
function editTask(taskData) {
  task.value = { ...taskData };
  taskDialog.value = true;
}

async function saveTask() {
  submitted.value = true;
  if (!task.value.description?.trim() || !task.value.roomId) {
    if(!task.value.description?.trim()) toast.add({ severity: 'warn', summary: t('common.warning'), detail: t('errors.descriptionRequired'), life: 3000 });
    if(!task.value.roomId) toast.add({ severity: 'warn', summary: t('common.warning'), detail: t('tasks.roomRequired'), life: 3000 });
    return;
  }

  try {
    if (task.value.id) {
      // Actualización (Store no tiene esta acción aún, usamos el repo directo)
      // await store.updateTask(task.value.id, task.value); // <-- Ideal
      await propertyRepository.updateTask(task.value.id, task.value); // <-- Solución temporal
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('tasks.taskUpdated'), life: 3000 });
    }
    else {
      // Creación (Llama al Store)
      const newTaskData = {
        ...task.value,
        assignedTo: staffId.value,
        // 'createdAt' será manejado por el Caso de Uso en el store
      };
      await store.createTask(newTaskData);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('tasks.taskCreated'), life: 3000 });
    }
    await loadTasks(); // Recarga
    hideDialog();
  } catch (error) {
    console.error("Error saving task (Vista):", error);
    toast.add({ severity: 'error', summary: t('errors.saveError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  }
}

// Checkbox (Llama al Store)
async function toggleTaskCompletion(taskData) {
  const originalStatus = taskData.status;
  const newIsCompleted = taskData.isCompleted;

  try {
    const newStatus = newIsCompleted ? 'Completada' : 'Pendiente';
    await store.updateTaskStatus(taskData.id, newStatus, staffId.value);

    if (newIsCompleted) {
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('staffDashboard.taskCompleted'), life: 2000 });
    } else {
      toast.add({ severity: 'info', summary: t('common.updated'), detail: t('tasks.taskMarkedPending'), life: 2000 });
    }
    // El store ya recarga la lista
  } catch (error) {
    taskData.isCompleted = !newIsCompleted; // Revertir
    console.error("Error toggling task status (Vista):", error);
    toast.add({ severity: 'error', summary: t('errors.taskError'), detail: error.message || t('errors.tryAgain'), life: 3000 });
  }
}

function confirmDeleteTask(taskData) {
  task.value = taskData;
  confirm.require({
    message: t('tasks.deleteConfirmMsg', { description: taskData.description }),
    header: t('adminManageUsers.confirmDeleteHeader'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.cancel'),
    accept: async () => {
      // await store.deleteTask(taskData.id); // <-- Ideal
      await propertyRepository.deleteTask(taskData.id); // <-- Solución temporal
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('tasks.taskDeleted'), life: 3000 });
      await loadTasks(); // Recarga manual
    },
    reject: () => {
      toast.add({ severity: 'info', summary: t('common.cancelled'), detail: t('adminManageUsers.deleteCancelled'), life: 3000 });
    }
  });
}

// --- Helpers Visuales (Usan datos del Store) ---
function getRoomNumber(roomId) {
  const room = store.rooms.find(r => r.id === roomId); // Usa store.rooms
  return room ? room.number : `ID: ${roomId}`;
}
function getStatusSeverity(status) {
  if (!status) return 'secondary';
  const s = status.toLowerCase();
  switch (s) {
    case 'completada': return 'success';
    case 'en proceso': return 'info';
    case 'pendiente': return 'warning';
    default: return 'secondary';
  }
}
function formatDateTime(dateString) {
  if (!dateString) return t('common.notAvailable');
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return dateString;
  }
}
</script>

<style scoped>
/* (Estilos de tu v1) */
.task-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
.p-button.p-button-warning.p-button-text {
  color: var(--orange-500);
}
.p-button.p-button-success.p-button-text {
  color: var(--green-500);
}
.card {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.mb-4 { margin-bottom: 1rem; }
.mr-2 { margin-right: 0.5rem; }
.flex { display: flex; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.text-xl { font-size: 1.25rem; }
.m-0 { margin: 0; }
.text-center { text-align: center; }
</style>