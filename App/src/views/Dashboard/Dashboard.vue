<template>
  <div class="dashboard-wrapper p-3">
    <!-- Row 1: Key Statistics -->
    <div class="stat-grid mb-3">
      <Card class="stat-card total-runs">
        <template #content>
          <div class="flex align-items-center">
            <div class="icon-container bg-blue-100 text-blue-600 mr-3">
              <i class="pi pi-play"></i>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-400">Total Runs</div>
              <div class="text-2xl font-bold">{{ stats.total }}</div>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="stat-card success-rate">
        <template #content>
          <div class="flex align-items-center">
            <div class="icon-container bg-green-100 text-green-600 mr-3">
              <i class="pi pi-check-circle"></i>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-400">Success Rate</div>
              <div class="text-2xl font-bold text-green-600">{{ stats.successRate }}%</div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card failure-rate">
        <template #content>
          <div class="flex align-items-center">
            <div class="icon-container bg-red-100 text-red-600 mr-3">
              <i class="pi pi-times-circle"></i>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-400">Failures</div>
              <div class="text-2xl font-bold text-red-600">{{ stats.failed }}</div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card active-workflows">
        <template #content>
          <div class="flex align-items-center">
            <div class="icon-container bg-purple-100 text-purple-600 mr-3">
              <i class="pi pi-sitemap"></i>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-400">Workflows</div>
              <div class="text-2xl font-bold">{{ activeWorkflowsCount }}</div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Row 2: Main Content -->
    <div class="main-grid">
      <!-- Left Column: Status Chart & Quick Actions -->
      <div class="flex flex-column gap-3">
        <Card class="chart-card">
          <template #title><span class="text-lg">System Health</span></template>
          <template #content>
            <div class="chart-container">
              <Chart type="doughnut" :data="chartData" :options="chartOptions" />
            </div>
          </template>
        </Card>

        <Card class="quick-actions-card">
          <template #title><span class="text-lg">Quick Actions</span></template>
          <template #content>
            <div class="flex flex-column gap-2">
              <Button label="New Workflow" icon="pi pi-plus" size="small" class="p-button-outlined" @click="$router.push('/workflow')" />
              <Button label="View Full Logs" icon="pi pi-list" size="small" text @click="$router.push('/logs')" />
              <Button label="Export History" icon="pi pi-download" size="small" text />
            </div>
          </template>
        </Card>
      </div>

      <!-- Center Column: Recent Runs -->
      <Card class="history-card">
        <template #title>
          <div class="flex align-items-center justify-content-between">
            <span class="text-lg">Recent Workflow Runs</span>
          </div>
        </template>
        <template #content>
          <DataTable :value="history" :rows="6" responsiveLayout="scroll" :loading="loading" class="compact-table">
            <Column field="workflowName" header="Workflow" style="min-width: 150px;"></Column>
            <Column field="runDate" header="Date"></Column>
            <Column header="Status">
              <template #body="slotProps">
                <Tag :value="getStatusLabel(slotProps.data.status)" :severity="getStatusSeverity(slotProps.data.status)" />
              </template>
            </Column>
            <Column class="text-center">
               <template #body="slotProps">
                  <Button icon="pi pi-search" rounded text @click="viewRunDetails(slotProps.data.id)" />
               </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Right Column: Active Workflows -->
      <Card class="workflows-card">
        <template #title><span class="text-lg">Active Workflows</span></template>
        <template #content>
          <div class="workflow-list">
            <div v-for="wf in workflowsList" :key="wf.id" class="workflow-item p-2 mb-2 border-round hover-effect">
              <div class="flex align-items-center justify-content-between">
                <span class="font-medium text-sm">{{ wf.name }}</span>
                <i class="pi pi-chevron-right text-xs text-gray-400"></i>
              </div>
              <div class="text-xs text-gray-500 mt-1">Updated {{ wf.updatedAt || 'Recently' }}</div>
            </div>
            <div v-if="workflowsList.length === 0" class="text-center py-4 text-gray-400">
              No workflows found
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { listWorkflowRunHistory, getAllWorkflows } from '@/views/Workflow/Process/Process.List.api';
import { NodeStatus } from 'proto/workflow/workflow_pb';

const loading = ref(true);
const history = ref<any[]>([]);
const workflowsList = ref<any[]>([]);
const activeWorkflowsCount = ref(0);

const stats = computed(() => {
  const total = history.value.length;
  if (total === 0) return { total: 0, success: 0, failed: 0, successRate: 0, failureRate: 0 };
  
  const success = history.value.filter(h => h.status === NodeStatus.COMPLETED).length;
  const failed = history.value.filter(h => h.status === NodeStatus.FAILED).length;
  
  return {
    total,
    success,
    failed,
    successRate: Math.round((success / total) * 100),
    failureRate: Math.round((failed / total) * 100)
  };
});

const chartData = computed(() => ({
  labels: ['Success', 'Failed'],
  datasets: [{
    data: [stats.value.success, stats.value.failed],
    backgroundColor: ['#22C55E', '#EF4444'],
    hoverBackgroundColor: ['#16A34A', '#DC2626']
  }]
}));

const chartOptions = {
  plugins: { legend: { display: false } },
  cutout: '75%',
  maintainAspectRatio: false
};

const getStatusLabel = (status: number) => {
  switch (status) {
    case NodeStatus.COMPLETED: return 'Success';
    case NodeStatus.FAILED: return 'Failed';
    case NodeStatus.RUNNING: return 'Running';
    default: return 'Success';
  }
};

const getStatusSeverity = (status: number) => {
  switch (status) {
    case NodeStatus.COMPLETED: return 'success';
    case NodeStatus.FAILED: return 'danger';
    case NodeStatus.RUNNING: return 'info';
    default: return 'success';
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [historyList, workflows] = await Promise.all([
      listWorkflowRunHistory(),
      getAllWorkflows(6, 0)
    ]);
    
    history.value = historyList.getHistoryList().map(h => ({
      id: h.getId(),
      workflowId: h.getWorkflowid(),
      workflowName: h.getWorkflowname(),
      runDate: h.getRundate(),
      status: h.getStatus()
    }));
    
    workflowsList.value = workflows.getWorkflowsList().map(w => ({
      id: w.getId(),
      name: w.getName(),
      updatedAt: w.getUpdatedat()
    }));
    activeWorkflowsCount.value = workflows.getTotal();
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    loading.value = false;
  }
};

const viewRunDetails = (processId: string) => {
  console.log('Viewing details for:', processId);
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.dashboard-wrapper {
  background-color: var(--surface-b);
  min-height: 100vh;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.main-grid {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 1rem;
  align-items: start;
}

@media screen and (max-width: 1280px) {
  .main-grid {
    grid-template-columns: 280px 1fr;
  }
  .workflows-card {
     grid-column: span 2;
  }
}

@media screen and (max-width: 900px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  .workflows-card, .history-card {
     grid-column: span 1;
  }
}

.stat-card {
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.icon-container {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.chart-container {
  height: 160px;
  position: relative;
}

.workflow-item {
  border: 1px solid var(--surface-d);
  cursor: pointer;
  transition: all 0.2s;
}

.hover-effect:hover {
  background-color: var(--surface-a);
  border-color: var(--blue-200);
  transform: translateX(4px);
}

:deep(.p-card-body) {
  padding: 1rem !important;
}

:deep(.p-datatable.compact-table .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
}

:deep(.p-datatable.compact-table .p-datatable-tbody > tr > td) {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
}

.flex { display: flex; }
.flex-column { flex-direction: column; }
.align-items-center { align-items: center; }
.justify-content-between { justify-content: space-between; }
.justify-content-center { justify-content: center; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 1rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mt-1 { margin-top: 0.25rem; }
.mr-3 { margin-right: 1rem; }
.border-round { border-radius: 6px; }
.w-full { width: 100%; }
</style>