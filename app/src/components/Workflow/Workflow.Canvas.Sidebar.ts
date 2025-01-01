import { ref, computed } from "vue";
import nodes from "../Config/nodes";
import { Node } from "../Common/Interfaces"
import iconStyles from "../Icons/Icon.Style";

const showSideBar = ref<boolean>(false);
const search = ref<string>('');
const draggedNode = ref<Node | null>(null);
const expandGroup = ref<string[]>([]);

const searchNode = computed(() => {
    return nodes.filter(f => f.type.toLowerCase().includes(search.value))
})

export default class WorkflowCanvasSidebar {
    static store = {
        showSideBar,
        search,
        searchNode,
        draggedNode,
        expandGroup
    }
    static onDragStart(node: Node) {
        draggedNode.value = node;
        document.addEventListener('drop', this.onDragEnd);
    }
    static onDragEnd() {
        draggedNode.value = null
        document.removeEventListener('drop', this.onDragEnd)
    }
    static iconColor(type: string) {
        var filterStyle = iconStyles.filter(f => f.name == type);
        if (filterStyle.length > 0)
            return filterStyle[0];
        else
            return {
                icon: "square",
                color: "#fff"
            }
    }
    static expandToggle(name: string) {
        if (expandGroup.value.includes(name))
            expandGroup.value.splice(expandGroup.value.findIndex(f => f == name));
        else
            expandGroup.value.push(name)
    }
}