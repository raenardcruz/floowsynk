import { Ref } from 'vue'
import { GraphNode } from "@vue-flow/core";

export const clickhandler = (node: GraphNode<any, any, string>, tabid: string, show: Ref<boolean>) => {
    if (node.id == '0') {
        const event = new CustomEvent('type-select', { detail: { tabid } });
        window.dispatchEvent(event);
    } else {
        show.value = true;
    }
}