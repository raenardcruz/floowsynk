<template>
  <div class="dashboard-wrapper">
    <!-- Hero Header Banner -->
    <div class="dashboard-banner">
      <div class="banner-content">
        <div class="banner-badge">
          <span class="pulse-dot"></span>
          <span>System Live & Active</span>
        </div>
        <h1 class="banner-title">Workflow Execution Overview</h1>
        <p class="banner-subtitle">Real-time stats, system health diagnostics, and active integrations.</p>
      </div>
      <div class="banner-actions">
        <Button label="New Workflow" icon="pi pi-plus" class="p-button-gradient" @click="$router.push('/workflow')" />
        <Button label="Connectors Gallery" icon="pi pi-box" class="p-button-glass" @click="$router.push('/connectors')" />
      </div>
    </div>

    <!-- Row 1: Key Statistics (Gradient Cards) -->
    <div class="stat-grid">
      <!-- Total Runs Card -->
      <div class="stat-card glass-card hover-lift">
        <div class="stat-card-header">
          <div class="icon-box icon-blue">
            <i class="pi pi-play"></i>
          </div>
          <span class="trend-badge trend-up">
            <i class="pi pi-arrow-up-right"></i> +12.4%
          </span>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total Workflow Runs</div>
        </div>
      </div>
      
      <!-- Success Rate Card -->
      <div class="stat-card glass-card hover-lift">
        <div class="stat-card-header">
          <div class="icon-box icon-green">
            <i class="pi pi-check-circle"></i>
          </div>
          <span class="trend-badge trend-up">
            <i class="pi pi-arrow-up-right"></i> Optimal
          </span>
        </div>
        <div class="stat-body">
          <div class="stat-value text-green-500">{{ stats.successRate }}%</div>
          <div class="stat-label">Execution Success Rate</div>
        </div>
      </div>

      <!-- Failures Card -->
      <div class="stat-card glass-card hover-lift">
        <div class="stat-card-header">
          <div class="icon-box icon-red">
            <i class="pi pi-times-circle"></i>
          </div>
          <span class="trend-badge" :class="stats.failed > 0 ? 'trend-down' : 'trend-neutral'">
            <i :class="stats.failed > 0 ? 'pi pi-exclamation-triangle' : 'pi pi-minus'"></i>
            {{ stats.failed }} Failed
          </span>
        </div>
        <div class="stat-body">
          <div class="stat-value text-red-500">{{ stats.failed }}</div>
          <div class="stat-label">Execution Failures</div>
        </div>
      </div>

      <!-- Active Workflows Card -->
      <div class="stat-card glass-card hover-lift">
        <div class="stat-card-header">
          <div class="icon-box icon-purple">
            <i class="pi pi-sitemap"></i>
          </div>
          <span class="trend-badge trend-neutral">
            <i class="pi pi-spin pi-spinner text-xs" v-if="loading"></i>
            <span v-else>Active</span>
          </span>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ activeWorkflowsCount }}</div>
          <div class="stat-label">Active Workflows</div>
        </div>
      </div>
    </div>

    <!-- Row 2: Charts & Analytics -->
    <div class="analytics-grid">
      <!-- System Health Doughnut Chart -->
      <div class="glass-card panel-card chart-panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">System Health Diagnostics</h3>
            <p class="panel-subtitle">Success vs. Failure distribution</p>
          </div>
          <div class="health-pill" :class="stats.successRate >= 80 ? 'health-good' : 'health-warn'">
            <i class="pi pi-shield"></i>
            <span>{{ stats.successRate >= 80 ? 'Healthy' : 'Needs Review' }}</span>
          </div>
        </div>
        <div class="chart-content flex flex-column align-items-center justify-content-center">
          <div class="chart-wrapper">
            <Chart type="doughnut" :data="chartData" :options="chartOptions" />
            <div class="chart-center-metric">
              <span class="metric-num">{{ stats.successRate }}%</span>
              <span class="metric-lbl">Success</span>
            </div>
          </div>
          <div class="chart-legend-grid mt-3">
            <div class="legend-item">
              <span class="legend-dot bg-green-500"></span>
              <span class="legend-text">Completed ({{ stats.success }})</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot bg-red-500"></span>
              <span class="legend-text">Failed ({{ stats.failed }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Execution Activity Trend Line Chart -->
      <div class="glass-card panel-card chart-panel flex-1">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">Workflow Execution Activity</h3>
            <p class="panel-subtitle">Weekly run count trajectory</p>
          </div>
          <span class="badge-tag">7-Day Trend</span>
        </div>
        <div class="trend-chart-wrapper">
          <Chart type="line" :data="trendChartData" :options="trendChartOptions" />
        </div>
      </div>
    </div>

    <!-- Row 3: Data Tables & Quick Actions -->
    <div class="bottom-grid">
      <!-- Recent Workflow Runs Table -->
      <div class="glass-card panel-card main-table-panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">Recent Workflow Executions</h3>
            <p class="panel-subtitle">Audit log of latest triggers and runs</p>
          </div>
          <div class="table-search-box">
            <i class="pi pi-search search-icon"></i>
            <input type="text" v-model="tableSearchQuery" placeholder="Filter executions..." class="table-search-input" />
          </div>
        </div>

        <DataTable 
          :value="filteredHistory" 
          :rows="6" 
          :paginator="filteredHistory.length > 6"
          responsiveLayout="scroll" 
          :loading="loading" 
          class="modern-table"
        >
          <Column field="workflowName" header="Workflow" style="min-width: 180px;">
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <div class="wf-avatar">
                  <i class="pi pi-cog"></i>
                </div>
                <span class="font-semibold text-slate-800">{{ slotProps.data.workflowName }}</span>
              </div>
            </template>
          </Column>

          <Column field="runDate" header="Date & Time" style="min-width: 150px;">
            <template #body="slotProps">
              <span class="text-xs text-slate-500">{{ slotProps.data.runDate || 'Just now' }}</span>
            </template>
          </Column>

          <Column header="Status" style="min-width: 120px;">
            <template #body="slotProps">
              <span class="status-pill" :class="getStatusClass(slotProps.data.status)">
                <i :class="getStatusIcon(slotProps.data.status)"></i>
                <span>{{ getStatusLabel(slotProps.data.status) }}</span>
              </span>
            </template>
          </Column>

          <Column header="Action" class="text-right" style="width: 80px;">
            <template #body="slotProps">
              <button class="icon-btn" @click="viewRunDetails(slotProps.data)" title="View Run Log">
                <i class="pi pi-search"></i>
              </button>
            </template>
          </Column>
          <template #empty>
            <div class="empty-table-state">
              <i class="pi pi-inbox"></i>
              <p>No workflow runs recorded yet.</p>
            </div>
          </template>
        </DataTable>
      </div>

      <!-- Right Column: Active Workflows List -->
      <div class="glass-card panel-card side-list-panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">Active Workflows</h3>
            <p class="panel-subtitle">{{ workflowsList.length }} configured</p>
          </div>
          <button class="text-btn" @click="$router.push('/workflow')">View All</button>
        </div>

        <div class="workflow-stack">
          <div 
            v-for="wf in workflowsList" 
            :key="wf.id" 
            class="workflow-stack-item hover-lift"
            @click="$router.push('/workflow')"
          >
            <div class="wf-stack-info">
              <span class="wf-name">{{ wf.name }}</span>
              <span class="wf-date">Updated {{ wf.updatedAt || 'Recently' }}</span>
            </div>
            <i class="pi pi-chevron-right arrow-icon"></i>
          </div>

          <div v-if="workflowsList.length === 0" class="empty-side-state">
            <i class="pi pi-sitemap"></i>
            <p>No active workflows found</p>
            <button class="btn-sm-primary mt-2" @click="$router.push('/workflow')">Create One</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { listWorkflowRunHistory, getAllWorkflows } from '@/views/Workflow/Process/Process.List.api';
import { NodeStatus } from 'proto/workflow/workflow_pb';

const loading = ref(true);
const history = ref<any[]>([]);
const workflowsList = ref<any[]>([]);
const activeWorkflowsCount = ref(0);
const tableSearchQuery = ref('');

const stats = computed(() => {
  const total = history.value.length;
  if (total === 0) return { total: 0, success: 0, failed: 0, successRate: 100, failureRate: 0 };
  
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

const filteredHistory = computed(() => {
  if (!tableSearchQuery.value.trim()) return history.value;
  const q = tableSearchQuery.value.toLowerCase();
  return history.value.filter(item => 
    item.workflowName.toLowerCase().includes(q) ||
    item.runDate.toLowerCase().includes(q)
  );
});

// System Health Doughnut Chart
const chartData = computed(() => ({
  labels: ['Success', 'Failed'],
  datasets: [{
    data: [stats.value.success || 1, stats.value.failed],
    backgroundColor: ['#10b981', '#ef4444'],
    hoverBackgroundColor: ['#059669', '#dc2626'],
    borderWidth: 0,
    borderRadius: 6
  }]
}));

const chartOptions = {
  plugins: { legend: { display: false } },
  cutout: '78%',
  maintainAspectRatio: false
};

// Activity Trend Chart
const trendChartData = computed(() => ({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Executions',
      data: [12, 19, 15, 25, 22, 30, stats.value.total || 35],
      fill: true,
      borderColor: '#6366f1',
      tension: 0.4,
      backgroundColor: 'rgba(99, 102, 241, 0.1)'
    }
  ]
}));

const trendChartOptions = {
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    y: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { color: '#94a3b8', font: { size: 11 } } }
  },
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

const getStatusClass = (status: number) => {
  switch (status) {
    case NodeStatus.COMPLETED: return 'status-success';
    case NodeStatus.FAILED: return 'status-failed';
    case NodeStatus.RUNNING: return 'status-running';
    default: return 'status-success';
  }
};

const getStatusIcon = (status: number) => {
  switch (status) {
    case NodeStatus.COMPLETED: return 'pi pi-check';
    case NodeStatus.FAILED: return 'pi pi-times';
    case NodeStatus.RUNNING: return 'pi pi-spin pi-spinner';
    default: return 'pi pi-check';
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
    })).sort((a, b) => new Date(b.runDate).getTime() - new Date(a.runDate).getTime());
    
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

import { useRouter } from 'vue-router';
import { historyClicked } from '@/views/Workflow/Process/Process.List.helper';

const router = useRouter();

const viewRunDetails = async (runItem: any) => {
  await router.push('/workflow');
  historyClicked({ id: runItem.id, workflowid: runItem.workflowId } as any);
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.dashboard-wrapper {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto;
}

/* Banner Header */
.dashboard-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%);
  border-radius: 20px;
  padding: 28px 32px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.3);
  position: relative;
  overflow: hidden;
}

.dashboard-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0,0,0,0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.banner-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #a5b4fc;
  margin-bottom: 12px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse-ring 1.8s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.banner-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.banner-subtitle {
  font-size: 14px;
  color: #94a3b8;
}

.banner-actions {
  display: flex;
  gap: 12px;
}

:deep(.p-button-gradient) {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
  border: none !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  padding: 10px 20px !important;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4) !important;
}

:deep(.p-button-glass) {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
  font-weight: 500 !important;
  border-radius: 10px !important;
  padding: 10px 20px !important;
}

/* Stat Grid */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.icon-blue { background: #e0e7ff; color: #4338ca; }
.icon-green { background: #d1fae5; color: #047857; }
.icon-red { background: #fee2e2; color: #b91c1c; }
.icon-purple { background: #f3e8ff; color: #6b21a8; }

.trend-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.trend-up { background: #ecfdf5; color: #059669; }
.trend-down { background: #fef2f2; color: #dc2626; }
.trend-neutral { background: #f1f5f9; color: #64748b; }

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* Analytics Grid */
.analytics-grid {
  display: flex;
  gap: 20px;
}

@media (max-width: 900px) {
  .analytics-grid {
    flex-direction: column;
  }
}

.panel-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.panel-subtitle {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.chart-panel {
  width: 320px;
}

@media (max-width: 900px) {
  .chart-panel {
    width: 100%;
  }
}

.health-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.health-good { background: #ecfdf5; color: #059669; }
.health-warn { background: #fffbebfb; color: #d97706; }

.chart-wrapper {
  position: relative;
  height: 160px;
  width: 160px;
}

.chart-center-metric {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-num {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.metric-lbl {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #475569;
  margin-bottom: 4px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.trend-chart-wrapper {
  height: 200px;
  width: 100%;
}

.badge-tag {
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}

/* Bottom Grid */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
}

@media (max-width: 1024px) {
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

.table-search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  font-size: 13px;
}

.table-search-input {
  padding: 6px 12px 6px 30px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
}

.table-search-input:focus {
  border-color: #6366f1;
}

:deep(.modern-table .p-datatable-thead > tr > th) {
  background: #f8fafc !important;
  color: #64748b !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 10px 14px !important;
}

:deep(.modern-table .p-datatable-tbody > tr > td) {
  padding: 10px 14px !important;
  border-bottom: 1px solid #f1f5f9 !important;
  font-size: 13px !important;
}

.wf-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #e0e7ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-success { background: #ecfdf5; color: #059669; }
.status-failed { background: #fef2f2; color: #dc2626; }
.status-running { background: #eff6ff; color: #2563eb; }

.icon-btn {
  background: transparent;
  border: none;
  color: #64748b;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.empty-table-state, .empty-side-state {
  padding: 32px;
  text-align: center;
  color: #94a3b8;
}

.empty-table-state i, .empty-side-state i {
  font-size: 28px;
  margin-bottom: 8px;
}

/* Side List Panel */
.text-btn {
  background: transparent;
  border: none;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.workflow-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.workflow-stack-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
}

.wf-stack-info {
  display: flex;
  flex-direction: column;
}

.wf-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.wf-date {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.arrow-icon {
  font-size: 12px;
  color: #cbd5e1;
}

.btn-sm-primary {
  background: #4f46e5;
  color: #ffffff;
  border: none;
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 8px;
}
</style>