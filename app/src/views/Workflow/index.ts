import Workflow from "./Workflow.vue";
export { useWorkflowStore, useTab } from "./Workflow.hooks";
export type { Process, Node, Group } from "./Workflow.types";
export { newProcess } from './Workflow.factory';
export default Workflow;