import {
    PageRequest,
    Credential,
    Token,
    GetWorkflowRequest,
    WorkflowList,
    Workflow,
    Edge,
    Node,
    NodeData,
    NodeIcon,
    NodeDimensions,
    NodePosition,
    KeyValue,
    NodeHandleBounds,
    Handle,
    NodeDataArray,
 } from 'proto/floowsynk_pb'
 import type { Node as vfNode } from '@vue-flow/core'

function normalizeObject(obj: any): any {
    return Object.keys(obj).reduce((acc, key) => {
        acc[key.toLowerCase()] = obj[key];
        return acc;
    }, {} as any);
}

export function ToVueFlowNode(node: any): vfNode {
  const normalizedNodeData = Object.keys(node).reduce((acc, key) => {
    acc[key.toLowerCase()] = node[key];
    return acc;
  }, {} as Record<string, any>) as vfNode;
  return normalizedNodeData;
}

export function DenormalizeVueFlowObject(obj: any): any {
  const edgeTypeMap = {
    "sourcehandle": "sourceHandle",
    "targethandle": "targetHandle",
    "interactionwidth": "interactionWidth",
    "tabid": "tabId",
    "sourcenode": "sourceNode",
    "targetnode": "targetNode",
    "sourcex": "sourceX",
    "sourcey": "sourceY",
    "targetx": "targetX",
    "targety": "targetY"
  }
  const normalizedEdgeData = Object.keys(obj).reduce((acc, key) => {
    acc[edgeTypeMap[key as keyof typeof edgeTypeMap] || key] = obj[key];
    return acc;
  }, {} as any) ;
  return normalizedEdgeData;
}

export function handleFromObject(obj: any): Handle {
    const msg = new Handle();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.x !== undefined) {
      msg.setX(normalizedObj.x);
    }
    if (normalizedObj.y !== undefined) {
      msg.setY(normalizedObj.y);
    }
    if (normalizedObj.id !== undefined) {
      msg.setId(normalizedObj.id);
    }
    if (normalizedObj.type !== undefined) {
      msg.setType(normalizedObj.type);
    }
    if (normalizedObj.width !== undefined) {
      msg.setWidth(normalizedObj.width);
    }
    if (normalizedObj.height !== undefined) {
      msg.setHeight(normalizedObj.height);
    }
    if (normalizedObj.nodeid !== undefined) {
      msg.setNodeid(normalizedObj.nodeid);
    }
    if (normalizedObj.position !== undefined) {
      msg.setPosition(normalizedObj.position);
    }
    return msg;
  }

export function nodeHandleBoundsFromObject(obj: any): NodeHandleBounds {
    const msg = new NodeHandleBounds();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.sourcelist !== undefined) {
      const source = normalizedObj.sourcelist.map(handleFromObject);
      msg.setSourceList(source);
    }
    if (normalizedObj.targetlist !== undefined) {
      const target = normalizedObj.targetlist.map(handleFromObject);
      msg.setTargetList(target);
    }
    return msg;
  }

export function keyValueFromObject(obj: any): KeyValue {
    const msg = new KeyValue();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.key !== undefined) {
      msg.setKey(normalizedObj.key);
    }
    if (normalizedObj.value !== undefined) {
      msg.setValue(normalizedObj.value);
    }
    return msg;
  }

export function nodePositionFromObject(obj: any): NodePosition {
    const msg = new NodePosition();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.x !== undefined) {
      msg.setX(normalizedObj.x);
    }
    if (normalizedObj.y !== undefined) {
      msg.setY(normalizedObj.y);
    }
    if (normalizedObj.z !== undefined) {
      msg.setZ(normalizedObj.z);
    }
    return msg;
  }

export function nodeDimensionsFromObject(obj: any): NodeDimensions {
    const msg = new NodeDimensions();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.width !== undefined) {
      msg.setWidth(normalizedObj.width);
    }
    if (normalizedObj.height !== undefined) {
      msg.setHeight(normalizedObj.height);
    }
    return msg;
  }

export function nodeIconFromObject(obj: any): NodeIcon {
    const msg = new NodeIcon();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.name !== undefined) {
      msg.setName(normalizedObj.name);
    }
    if (normalizedObj.color !== undefined) {
      msg.setColor(normalizedObj.color);
    }
    return msg;
  }

export function nodeDataArrayFromObject(obj: any): NodeDataArray {
    const msg = new NodeDataArray();
    const normalizedObj = normalizeObject(obj);
    msg.setType(normalizedObj.type);
    msg.setStringitemsList(normalizedObj.stringitemslist);
    if (normalizedObj.keyvalueitemslist !== undefined) {
      msg.setKeyvalueitemsList(normalizedObj.keyvalueitemslist.map(keyValueFromObject));
    }
    msg.setBoolitemsList(normalizedObj.boolitemslist);
    msg.setIntitemsList(normalizedObj.intitemslist);
    return msg;
  }

export function nodeDataFromObject(obj: any): NodeData {
    const msg = new NodeData();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.name !== undefined) {
      msg.setName(normalizedObj.name);
    }
    if (normalizedObj.value !== undefined) {
      msg.setValue(normalizedObj.value);
    }
    if (normalizedObj.expression !== undefined) {
      msg.setExpression(normalizedObj.expression);
    }
    if (normalizedObj.iteration !== undefined) {
      msg.setIteration(normalizedObj.iteration);
    }
    if (normalizedObj.listvar !== undefined) {
      msg.setListvar(normalizedObj.listvar);
    }
    if (normalizedObj.limit !== undefined) {
      msg.setLimit(normalizedObj.limit);
    }
    if (normalizedObj.url !== undefined) {
      msg.setUrl(normalizedObj.url);
    }
    if (normalizedObj.method !== undefined) {
      msg.setMethod(normalizedObj.method);
    }
    if (normalizedObj.headers !== undefined) {
      const nodeDataArray: NodeDataArray = nodeDataArrayFromObject(normalizedObj.headers);
      msg.setHeaders(nodeDataArray);
    }
    if (normalizedObj.payload !== undefined) {
      msg.setPayload(normalizedObj.payload);
    }
    if (normalizedObj.variable !== undefined) {
      msg.setVariable(normalizedObj.variable);
    }
    if (normalizedObj.message !== undefined) {
      msg.setMessage(normalizedObj.message);
    }
    if (normalizedObj.list !== undefined) {
      const nodeDataArray = nodeDataArrayFromObject(normalizedObj.list);
      msg.setList(nodeDataArray);
    }
    if (normalizedObj.listvariable !== undefined) {
      msg.setListvariable(normalizedObj.listvariable);
    }
    if (normalizedObj.template !== undefined) {
      msg.setTemplate(normalizedObj.template);
    }
    if (normalizedObj.text !== undefined) {
      msg.setText(normalizedObj.text);
    }
    if (normalizedObj.pattern !== undefined) {
      msg.setPattern(normalizedObj.pattern);
    }
    if (normalizedObj.replacetext !== undefined) {
      msg.setReplacetext(normalizedObj.replacetext);
    }
    if (normalizedObj.subprocessid !== undefined) {
      msg.setSubprocessid(normalizedObj.subprocessid);
    }
    if (normalizedObj.type !== undefined) {
      msg.setType(normalizedObj.type);
    }
    if (normalizedObj.interval !== undefined) {
      msg.setInterval(normalizedObj.interval);
    }
    if (normalizedObj.weeks !== undefined) {
      const nodeDataArray = nodeDataArrayFromObject(normalizedObj.weeks);
      msg.setWeeks(nodeDataArray);
    }
    return msg;
  }

export function nodeFromObject(obj: any): Node {
    const msg = new Node();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.id !== undefined) {
      msg.setId(normalizedObj.id);
    }
    if (normalizedObj.nodetype !== undefined) {
      msg.setNodetype(normalizedObj.nodetype);
    }
    if (normalizedObj.label !== undefined) {
      msg.setLabel(normalizedObj.label);
    }
    if (normalizedObj.data !== undefined) {
      const data = nodeDataFromObject(normalizedObj.data);
      msg.setData(data);
    }
    if (normalizedObj.grouplist !== undefined) {
      msg.setGroupList(normalizedObj.grouplist);
    }
    if (normalizedObj.nodestyle !== undefined) {
      msg.setNodestyle(normalizedObj.nodestyle);
    }
    if (normalizedObj.inputslist !== undefined) {
      msg.setInputsList(normalizedObj.inputslist);
    }
    if (normalizedObj.outputslist !== undefined) {
      msg.setOutputsList(normalizedObj.outputslist);
    }
    if (normalizedObj.draggable !== undefined) {
      msg.setDraggable(normalizedObj.draggable);
    }
    if (normalizedObj.icon !== undefined) {
      const icon = nodeIconFromObject(normalizedObj.icon);
      msg.setIcon(icon);
    }
    if (normalizedObj.position !== undefined) {
      const position = nodePositionFromObject(normalizedObj.position);
      msg.setPosition(position);
    }
    if (normalizedObj.nodestatus !== undefined) {
      msg.setNodestatus(normalizedObj.nodestatus);
    }
    if (normalizedObj.type !== undefined) {
      msg.setType(normalizedObj.type);
    }
    if (normalizedObj.dimensions !== undefined) {
      const dimensions = nodeDimensionsFromObject(normalizedObj.dimensions);
      msg.setDimensions(dimensions);
    }
    if (normalizedObj.handlebounds !== undefined) {
      const handleBounds = nodeHandleBoundsFromObject(normalizedObj.handlebounds);
      msg.setHandlebounds(handleBounds);
    }
    if (normalizedObj.computedposition !== undefined) {
      const computedPosition = nodePositionFromObject(normalizedObj.computedposition);
      msg.setComputedposition(computedPosition);
    }
    return msg;
  }

export function edgeFromObject(obj: any): Edge {
    const msg = new Edge();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.id !== undefined) {
      msg.setId(normalizedObj.id);
    }
    if (normalizedObj.type !== undefined) {
      msg.setType(normalizedObj.type);
    }
    if (normalizedObj.label !== undefined) {
      msg.setLabel(normalizedObj.label);
    }
    if (normalizedObj.tabid !== undefined) {
      msg.setTabid(normalizedObj.tabid);
    }
    if (normalizedObj.source !== undefined) {
      msg.setSource(normalizedObj.source);
    }
    if (normalizedObj.target !== undefined) {
      msg.setTarget(normalizedObj.target);
    }
    if (normalizedObj.sourcex !== undefined) {
      msg.setSourcex(normalizedObj.sourcex);
    }
    if (normalizedObj.sourcey !== undefined) {
      msg.setSourcey(normalizedObj.sourcey);
    }
    if (normalizedObj.targetx !== undefined) {
      msg.setTargetx(normalizedObj.targetx);
    }
    if (normalizedObj.targety !== undefined) {
      msg.setTargety(normalizedObj.targety);
    }
    if (normalizedObj.animated !== undefined) {
      msg.setAnimated(normalizedObj.animated);
    }
    if (normalizedObj.sourcenode !== undefined) {
      const sourceNode = nodeFromObject(normalizedObj.sourcenode);
      msg.setSourcenode(sourceNode);
    }
    if (normalizedObj.targetnode !== undefined) {
      const targetNode = nodeFromObject(normalizedObj.targetnode);
      msg.setTargetnode(targetNode);
    }
    if (normalizedObj.sourcehandle !== undefined) {
      msg.setSourcehandle(normalizedObj.sourcehandle);
    }
    if (normalizedObj.targethandle !== undefined) {
      msg.setTargethandle(normalizedObj.targethandle);
    }
    return msg;
  }

export function workflowFromObject(obj: any): Workflow {
    const msg = new Workflow();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.id !== undefined) {
      msg.setId(normalizedObj.id);
    }
    if (normalizedObj.name !== undefined) {
      msg.setName(normalizedObj.name);
    }
    if (normalizedObj.description !== undefined) {
      msg.setDescription(normalizedObj.description);
    }
    if (normalizedObj.nodeslist !== undefined) {
      const nodes = normalizedObj.nodeslist.map(nodeFromObject);
      msg.setNodesList(nodes);
    }
    if (normalizedObj.edgeslist !== undefined) {
      const edges = normalizedObj.edgeslist.map(edgeFromObject);
      msg.setEdgesList(edges);
    }
    if (normalizedObj.type !== undefined) {
      msg.setType(normalizedObj.type);
    }
    if (normalizedObj.createdat !== undefined) {
      msg.setCreatedat(normalizedObj.createdat);
    }
    if (normalizedObj.updatedat !== undefined) {
      msg.setUpdatedat(normalizedObj.updatedat);
    }
    if (normalizedObj.createdby !== undefined) {
      msg.setCreatedby(normalizedObj.createdby);
    }
    if (normalizedObj.updatedby !== undefined) {
      msg.setUpdatedby(normalizedObj.updatedby);
    }
    if (normalizedObj.tagslist !== undefined) {
      msg.setTagsList(normalizedObj.tagslist);
    }
    if (normalizedObj.isnew !== undefined) {
      msg.setIsnew(normalizedObj.isnew);
    }
    return msg;
  }

export function workflowListFromObject(obj: any): WorkflowList {
    const msg = new WorkflowList();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.total !== undefined) {
      msg.setTotal(normalizedObj.total);
    }
    if (normalizedObj.workflowslist !== undefined) {
      const workflows = normalizedObj.workflowslist.map(workflowFromObject);
      msg.setWorkflowsList(workflows);
    }
    return msg;
  }

export function getWorkflowRequestFromObject(obj: any): GetWorkflowRequest {
    const msg = new GetWorkflowRequest();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.id !== undefined) {
      msg.setId(normalizedObj.id);
    }
    return msg;
  }

export function pageRequestFromObject(obj: any): PageRequest {
    const msg = new PageRequest();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.limit !== undefined) {
      msg.setLimit(normalizedObj.limit);
    }
    if (normalizedObj.offset !== undefined) {
      msg.setOffset(normalizedObj.offset);
    }
    return msg;
  }

export function credentialFromObject(obj: any): Credential {
    const msg = new Credential();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.username !== undefined) {
      msg.setUsername(normalizedObj.username);
    }
    if (normalizedObj.password !== undefined) {
      msg.setPassword(normalizedObj.password);
    }
    return msg;
  }

export function tokenFromObject(obj: any): Token {
    const msg = new Token();
    const normalizedObj = normalizeObject(obj);
    if (normalizedObj.token !== undefined) {
      msg.setToken(normalizedObj.token);
    }
    return msg;
  }