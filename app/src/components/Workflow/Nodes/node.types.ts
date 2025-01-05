import { NodeTypesObject } from '@vue-flow/core';
import FloowsynkNode from './FloowsynkNode.vue';

const nodeTypes: NodeTypesObject = {
    start: FloowsynkNode,
    setVariable: FloowsynkNode,
    condition: FloowsynkNode,
    loop: FloowsynkNode,
    foreach: FloowsynkNode,
    while: FloowsynkNode,
    api: FloowsynkNode,
    log: FloowsynkNode,
    getGuid: FloowsynkNode,
    text: FloowsynkNode,
    math: FloowsynkNode,
    list: FloowsynkNode,
    count: FloowsynkNode,
    map: FloowsynkNode,
    replace: FloowsynkNode,
    regexfind: FloowsynkNode,
    image: FloowsynkNode,
    subprocess: FloowsynkNode,
} as NodeTypesObject;

export default nodeTypes;