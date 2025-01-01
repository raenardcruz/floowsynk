import { NodeComponent, NodeTypesObject } from '@vue-flow/core';
import FloowsynkNode from './FloowsynkNode.vue';

const nodeTypes: NodeTypesObject = {
    start: FloowsynkNode as unknown as NodeComponent,
    image: FloowsynkNode as unknown as NodeComponent,
};

export default nodeTypes;