import { ref, computed } from "vue";
import { nodes } from "@/components/Workflow/Nodes/node";
import { Node } from "@/components/Common/Interfaces"
import groups from "@/components/Workflow/Nodes/node.groups";
import CanvasHelper from "@/components/Workflow/Canvas/Workflow.Canvas";

const showSideBar = ref<boolean>(false);
const search = ref<string>('');
const draggedNode = ref<Node | null>(null);
const expandGroup = ref<string[]>([]);

const searchNode = computed(() => {
    return nodes.filter(f => f.nodetype.toLowerCase().includes(search.value) || f.label.toLowerCase().includes(search.value))
})

export default class WorkflowCanvasSidebar {
    static readonly store = {
        showSideBar, // ref
        search, // ref
        searchNode, // computed
        draggedNode, // ref
        expandGroup, // ref
        groups, // constant
    }
    static onDragStart(node: Node) {
        draggedNode.value = node;
        document.addEventListener('drop', this.onDragEnd);
    }
    static onDragEnd() {
        CanvasHelper.store.isDragOver.value = false
        draggedNode.value = null
        document.removeEventListener('drop', this.onDragEnd)
    }
    static expandToggle(name: string) {
        if (expandGroup.value.includes(name))
            expandGroup.value.splice(expandGroup.value.findIndex(f => f == name));
        else
            expandGroup.value.push(name)
    }
    static groupNodes(id: number): Node[] {
        return nodes.filter(f => f.group.includes(id))
    }
}