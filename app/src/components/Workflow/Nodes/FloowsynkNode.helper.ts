import { Ref } from 'vue'
import { GraphNode } from "@vue-flow/core";

export const clickhandler = (node: GraphNode<any, any, string>, showSidebar: Ref<boolean>, showModal: Ref<boolean>) => {
    if (node.id == '0') {
        showModal.value = true
    } else {
        showSidebar.value = true;
    }
}