<!-- El <template> de tu v1 'StaffTaskList.vue' es perfecto. -->
<!-- Solo cambiamos las variables para que apunten al Store. -->
<template>
  <div class="task-list-page">
    <pv-toast />
    <pv-confirm-dialog />

    <!-- ... (Toolbar: goBack, openNew) ... -->
    <pv-toolbar class="mb-4">
      <!-- ... -->
      <template #end> <LanguageSwitcher /> </template>
    </pv-toolbar>

    <!-- ... (Filtro SelectButton: statusFilter) ... -->

    <div class="card">
      <pv-data-table
          :value="filteredTasks" <!-- Usa computada local -->
      :loading="store.loading" <!-- Usa store.loading -->
      ...
      >
      <!-- ... (Header, Checkbox, Columnas) ... -->

      <pv-column field="roomId" :header="t('staffDashboard.taskRoom')" sortable>
        <template #body="slotProps">
          <!-- Usa computada local 'getRoomNumber' -->
          {{ getRoomNumber(slotProps.data.roomId) }}
        </template>
      </pv-column>

      <!-- ... (Resto de columnas y templates) ... -->

      </pv-data-table>
    </div>

    <!-- Diálogo (Formulario) -->
    <pv-dialog v-model:visible="taskDialog" ...>
      <!-- ... (Campos: description, status) ... -->
      <div class="field">
        <label for="roomId">{{ t('staffDashboard.taskRoom') }}</label>
        <pv-select
            id="roomId"
            v-model="task.roomId"
            :options="roomOptions" <!-- Usa computada local -->
        ...
        />
        <!-- ... -->
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
// ...
import Tooltip from 'primevue/tooltip';
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue';
// ...

// --- Importar el STORE ---
import { usePropertyStore } from '../../application/Property.store.js';


// Hooks
const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const vTooltip = Tooltip;

// --- Instancia STORE ---
const store = usePropertyStore();

// --- Estado LOCAL de la Vista (Formulario, Filtros) ---
// const allTasks = ref([]); // <-- AHORA VIVE EN EL STORE (store.tasks)
// const rooms = ref([]); // <-- AHORA VIVE EN EL STORE (store.rooms)
// const loading = ref(true); // <-- AHORA VIVE EN EL STORE (store.loading)
const staffId = ref(null);
const taskDialog = ref(false);
const task = ref({});
const submitted = ref(false);
const statusFilter = ref('Pendiente'); // Filtro local

// --- Opciones Computadas (Usan datos del Store) ---
const statusOptions = computed(() => [/* ... (igual que v1) ... */]);

const roomOptions = computed(() => {
  return store.rooms.map(room => ({ // Usa store.rooms
    label: `${t('tasks.roomLabel')} ${room.number} (${room.type || 'N/A'})`,
    value: room.id
  }));
});

const filterOptions = computed(() => [/* ... (igual que v1) ... */]);

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
function goBack() { /* ... (igual que v1) ... */ }

// --- Lógica del CRUD (Llama al Store) ---

function openNew() { /* ... (igual que v1) ... */ }
function hideDialog() { /* ... (igual que v1) ... */ }
function editTask(taskData) { /* ... (igual que v1) ... */ }

async function saveTask() {
  submitted.value = true;
  if (!task.value.description?.trim() || !task.value.roomId) {
    // ... (validación igual que v1)
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
  // ... (lógica de confirmación igual que v1)
  accept: async () => {
    // await store.deleteTask(taskData.id); // <-- Ideal
    await propertyRepository.deleteTask(taskData.id); // <-- Solución temporal
    await loadTasks(); // Recarga manual
  },
  // ...
}

// --- Helpers Visuales (Usan datos del Store) ---
function getRoomNumber(roomId) {
  const room = store.rooms.find(r => r.id === roomId); // Usa store.rooms
  return room ? room.number : `ID: ${roomId}`;
}
function getStatusSeverity(status) { /* ... (igual que v1) ... */ }
function formatDateTime(dateString) { /* ... (igual que v1) ... */ }
</script>

<style scoped>
/* (Estilos de tu v1) */
</style>