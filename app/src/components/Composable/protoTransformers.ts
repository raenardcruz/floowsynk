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
    Handle
 } from 'proto/floowsynk_pb'
 
 export function handleFromObject(obj: Handle.AsObject): Handle {
    const msg = new Handle();
    if (obj.x !== undefined) {
      msg.setX(obj.x);
    }
    if (obj.y !== undefined) {
      msg.setY(obj.y);
    }
    if (obj.id !== undefined) {
      msg.setId(obj.id);
    }
    if (obj.type !== undefined) {
      msg.setType(obj.type);
    }
    if (obj.width !== undefined) {
      msg.setWidth(obj.width);
    }
    if (obj.height !== undefined) {
      msg.setHeight(obj.height);
    }
    if (obj.nodeid !== undefined) {
      msg.setNodeid(obj.nodeid);
    }
    if (obj.position !== undefined) {
      msg.setPosition(obj.position);
    }
    return msg;
  }

 export function nodeHandleBoundsFromObject(obj: NodeHandleBounds.AsObject): NodeHandleBounds {
    const msg = new NodeHandleBounds();
    if (obj.sourceList !== undefined) {
      const source = obj.sourceList.map(handleFromObject);
      msg.setSourceList(source);
    }
    if (obj.targetList !== undefined) {
      const target = obj.targetList.map(handleFromObject);
      msg.setTargetList(target);
    }
    return msg;
  }

 export function keyValueFromObject(obj: KeyValue.AsObject): KeyValue {
    const msg = new KeyValue();
    if (obj.key !== undefined) {
      msg.setKey(obj.key);
    }
    if (obj.value !== undefined) {
      msg.setValue(obj.value);
    }
    return msg;
  }

 export function nodePositionFromObject(obj: NodePosition.AsObject): NodePosition {
    const msg = new NodePosition();
    if (obj.x !== undefined) {
      msg.setX(obj.x);
    }
    if (obj.y !== undefined) {
      msg.setY(obj.y);
    }
    if (obj.z !== undefined) {
      msg.setZ(obj.z);
    }
    return msg;
  }

 export function nodeDimensionsFromObject(obj: NodeDimensions.AsObject): NodeDimensions {
    const msg = new NodeDimensions();
    if (obj.width !== undefined) {
      msg.setWidth(obj.width);
    }
    if (obj.height !== undefined) {
      msg.setHeight(obj.height);
    }
    return msg;
  }

 export function nodeIconFromObject(obj: NodeIcon.AsObject): NodeIcon {
    const msg = new NodeIcon();
    if (obj.name !== undefined) {
      msg.setName(obj.name);
    }
    if (obj.color !== undefined) {
      msg.setColor(obj.color);
    }
    return msg;
  }

 export function nodeDataFromObject(obj: NodeData.AsObject): NodeData {
    const msg = new NodeData();
    if (obj.name !== undefined) {
      msg.setName(obj.name);
    }
    if (obj.value !== undefined) {
      msg.setValue(obj.value);
    }
    if (obj.expression !== undefined) {
      msg.setExpression(obj.expression);
    }
    if (obj.iteration !== undefined) {
      msg.setIteration(obj.iteration);
    }
    if (obj.listvar !== undefined) {
      msg.setListvar(obj.listvar);
    }
    if (obj.limit !== undefined) {
      msg.setLimit(obj.limit);
    }
    if (obj.url !== undefined) {
      msg.setUrl(obj.url);
    }
    if (obj.method !== undefined) {
      msg.setMethod(obj.method);
    }
    if (obj.headersList !== undefined) {
      const headers = obj.headersList.map(keyValueFromObject);
      msg.setHeadersList(headers);
    }
    if (obj.payload !== undefined) {
      msg.setPayload(obj.payload);
    }
    if (obj.variable !== undefined) {
      msg.setVariable(obj.variable);
    }
    if (obj.message !== undefined) {
      msg.setMessage(obj.message);
    }
    if (obj.listList !== undefined) {
      msg.setListList(obj.listList);
    }
    if (obj.listvariable !== undefined) {
      msg.setListvariable(obj.listvariable);
    }
    if (obj.template !== undefined) {
      msg.setTemplate(obj.template);
    }
    if (obj.text !== undefined) {
      msg.setText(obj.text);
    }
    if (obj.pattern !== undefined) {
      msg.setPattern(obj.pattern);
    }
    if (obj.replacetext !== undefined) {
      msg.setReplacetext(obj.replacetext);
    }
    if (obj.subprocessid !== undefined) {
      msg.setSubprocessid(obj.subprocessid);
    }
    if (obj.type !== undefined) {
      msg.setType(obj.type);
    }
    if (obj.interval !== undefined) {
      msg.setInterval(obj.interval);
    }
    if (obj.weeksList !== undefined) {
      msg.setWeeksList(obj.weeksList);
    }
    return msg;
  }

 export function nodeFromObject(obj: Node.AsObject): Node {
    const msg = new Node();
    if (obj.id !== undefined) {
      msg.setId(obj.id);
    }
    if (obj.nodetype !== undefined) {
      msg.setNodetype(obj.nodetype);
    }
    if (obj.label !== undefined) {
      msg.setLabel(obj.label);
    }
    if (obj.data !== undefined) {
      const data = nodeDataFromObject(obj.data);
      msg.setData(data);
    }
    if (obj.groupList !== undefined) {
      msg.setGroupList(obj.groupList);
    }
    if (obj.nodestyle !== undefined) {
      msg.setNodestyle(obj.nodestyle);
    }
    if (obj.inputsList !== undefined) {
      msg.setInputsList(obj.inputsList);
    }
    if (obj.outputsList !== undefined) {
      msg.setOutputsList(obj.outputsList);
    }
    if (obj.draggable !== undefined) {
      msg.setDraggable(obj.draggable);
    }
    if (obj.icon !== undefined) {
      const icon = nodeIconFromObject(obj.icon);
      msg.setIcon(icon);
    }
    if (obj.position !== undefined) {
      const position = nodePositionFromObject(obj.position);
      msg.setPosition(position);
    }
    if (obj.nodestatus !== undefined) {
      msg.setNodestatus(obj.nodestatus);
    }
    if (obj.type !== undefined) {
      msg.setType(obj.type);
    }
    if (obj.dimensions !== undefined) {
      const dimensions = nodeDimensionsFromObject(obj.dimensions);
      msg.setDimensions(dimensions);
    }
    if (obj.handlebounds !== undefined) {
      const handleBounds = nodeHandleBoundsFromObject(obj.handlebounds);
      msg.setHandlebounds(handleBounds);
    }
    if (obj.computedposition !== undefined) {
      const computedPosition = nodePositionFromObject(obj.computedposition);
      msg.setComputedposition(computedPosition);
    }
    if (obj.isparent !== undefined) {
      msg.setIsparent(obj.isparent);
    }
    return msg;
  }

 export function edgeFromObject(obj: Edge.AsObject): Edge {
    const msg = new Edge();
    if (obj.id !== undefined) {
      msg.setId(obj.id);
    }
    if (obj.type !== undefined) {
      msg.setType(obj.type);
    }
    if (obj.label !== undefined) {
      msg.setLabel(obj.label);
    }
    if (obj.tabid !== undefined) {
      msg.setTabid(obj.tabid);
    }
    if (obj.source !== undefined) {
      msg.setSource(obj.source);
    }
    if (obj.target !== undefined) {
      msg.setTarget(obj.target);
    }
    if (obj.sourcex !== undefined) {
      msg.setSourcex(obj.sourcex);
    }
    if (obj.sourcey !== undefined) {
      msg.setSourcey(obj.sourcey);
    }
    if (obj.targetx !== undefined) {
      msg.setTargetx(obj.targetx);
    }
    if (obj.targety !== undefined) {
      msg.setTargety(obj.targety);
    }
    if (obj.animated !== undefined) {
      msg.setAnimated(obj.animated);
    }
    if (obj.sourcenode !== undefined) {
      const sourceNode = nodeFromObject(obj.sourcenode);
      msg.setSourcenode(sourceNode);
    }
    if (obj.targetnode !== undefined) {
      const targetNode = nodeFromObject(obj.targetnode);
      msg.setTargetnode(targetNode);
    }
    if (obj.sourcehandle !== undefined) {
      msg.setSourcehandle(obj.sourcehandle);
    }
    if (obj.targethandle !== undefined) {
      msg.setTargethandle(obj.targethandle);
    }
    return msg;
  }

 export function workflowFromObject(obj: Workflow.AsObject): Workflow {
    const msg = new Workflow();
    if (obj.id !== undefined) {
      msg.setId(obj.id);
    }
    if (obj.name !== undefined) {
      msg.setName(obj.name);
    }
    if (obj.description !== undefined) {
      msg.setDescription(obj.description);
    }
    if (obj.nodesList !== undefined) {
      const nodes = obj.nodesList.map(nodeFromObject);
      msg.setNodesList(nodes);
    }
    if (obj.edgesList !== undefined) {
      const edges = obj.edgesList.map(edgeFromObject);
      msg.setEdgesList(edges);
    }
    if (obj.type !== undefined) {
      msg.setType(obj.type);
    }
    if (obj.createdat !== undefined) {
      msg.setCreatedat(obj.createdat);
    }
    if (obj.updatedat !== undefined) {
      msg.setUpdatedat(obj.updatedat);
    }
    if (obj.createdby !== undefined) {
      msg.setCreatedby(obj.createdby);
    }
    if (obj.updatedby !== undefined) {
      msg.setUpdatedby(obj.updatedby);
    }
    if (obj.tagsList !== undefined) {
      msg.setTagsList(obj.tagsList);
    }
    if (obj.isnew !== undefined) {
      msg.setIsnew(obj.isnew);
    }
    return msg;
  }

 export function workflowListFromObject(obj: WorkflowList.AsObject): WorkflowList {
    const msg = new WorkflowList();
    if (obj.total !== undefined) {
      msg.setTotal(obj.total);
    }
    if (obj.workflowsList !== undefined) {
      const workflows = obj.workflowsList.map(workflowFromObject);
      msg.setWorkflowsList(workflows);
    }
    return msg;
  }

 export function getWorkflowRequestFromObject(obj: GetWorkflowRequest.AsObject): GetWorkflowRequest {
    const msg = new GetWorkflowRequest();
    if (obj.id !== undefined) {
      msg.setId(obj.id);
    }
    return msg;
  }


export function pageRequestFromObject(obj: PageRequest.AsObject): PageRequest {
    const msg = new PageRequest();
    if (obj.limit !== undefined) {
      msg.setLimit(obj.limit);
    }
    if (obj.offset !== undefined) {
      msg.setOffset(obj.offset);
    }
    return msg;
  }

  export function credentialFromObject(obj: Credential.AsObject): Credential {
    const msg = new Credential();
    if (obj.username !== undefined) {
      msg.setUsername(obj.username);
    }
    if (obj.password !== undefined) {
      msg.setPassword(obj.password);
    }
    return msg;
  }

  export function tokenFromObject(obj: Token.AsObject): Token {
    const msg = new Token();
    if (obj.token !== undefined) {
      msg.setToken(obj.token);
    }
    return msg;
  }