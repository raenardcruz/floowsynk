import * as jspb from 'google-protobuf'

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"


export class RunWorkflowIdRequest extends jspb.Message {
  getId(): string;
  setId(value: string): RunWorkflowIdRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RunWorkflowIdRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RunWorkflowIdRequest): RunWorkflowIdRequest.AsObject;
  static serializeBinaryToWriter(message: RunWorkflowIdRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RunWorkflowIdRequest;
  static deserializeBinaryFromReader(message: RunWorkflowIdRequest, reader: jspb.BinaryReader): RunWorkflowIdRequest;
}

export namespace RunWorkflowIdRequest {
  export type AsObject = {
    id: string,
  }
}

export class WorkflowHistoryList extends jspb.Message {
  getHistoryList(): Array<WorkflowHistory>;
  setHistoryList(value: Array<WorkflowHistory>): WorkflowHistoryList;
  clearHistoryList(): WorkflowHistoryList;
  addHistory(value?: WorkflowHistory, index?: number): WorkflowHistory;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WorkflowHistoryList.AsObject;
  static toObject(includeInstance: boolean, msg: WorkflowHistoryList): WorkflowHistoryList.AsObject;
  static serializeBinaryToWriter(message: WorkflowHistoryList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WorkflowHistoryList;
  static deserializeBinaryFromReader(message: WorkflowHistoryList, reader: jspb.BinaryReader): WorkflowHistoryList;
}

export namespace WorkflowHistoryList {
  export type AsObject = {
    historyList: Array<WorkflowHistory.AsObject>,
  }
}

export class WorkflowHistory extends jspb.Message {
  getId(): string;
  setId(value: string): WorkflowHistory;

  getWorkflowid(): string;
  setWorkflowid(value: string): WorkflowHistory;

  getWorkflowname(): string;
  setWorkflowname(value: string): WorkflowHistory;

  getRundate(): string;
  setRundate(value: string): WorkflowHistory;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WorkflowHistory.AsObject;
  static toObject(includeInstance: boolean, msg: WorkflowHistory): WorkflowHistory.AsObject;
  static serializeBinaryToWriter(message: WorkflowHistory, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WorkflowHistory;
  static deserializeBinaryFromReader(message: WorkflowHistory, reader: jspb.BinaryReader): WorkflowHistory;
}

export namespace WorkflowHistory {
  export type AsObject = {
    id: string,
    workflowid: string,
    workflowname: string,
    rundate: string,
  }
}

export class WorkflowHistoryRequest extends jspb.Message {
  getId(): string;
  setId(value: string): WorkflowHistoryRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WorkflowHistoryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: WorkflowHistoryRequest): WorkflowHistoryRequest.AsObject;
  static serializeBinaryToWriter(message: WorkflowHistoryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WorkflowHistoryRequest;
  static deserializeBinaryFromReader(message: WorkflowHistoryRequest, reader: jspb.BinaryReader): WorkflowHistoryRequest;
}

export namespace WorkflowHistoryRequest {
  export type AsObject = {
    id: string,
  }
}

export class WorkflowHistoryResponse extends jspb.Message {
  getDataList(): Array<ReplayData>;
  setDataList(value: Array<ReplayData>): WorkflowHistoryResponse;
  clearDataList(): WorkflowHistoryResponse;
  addData(value?: ReplayData, index?: number): ReplayData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WorkflowHistoryResponse.AsObject;
  static toObject(includeInstance: boolean, msg: WorkflowHistoryResponse): WorkflowHistoryResponse.AsObject;
  static serializeBinaryToWriter(message: WorkflowHistoryResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WorkflowHistoryResponse;
  static deserializeBinaryFromReader(message: WorkflowHistoryResponse, reader: jspb.BinaryReader): WorkflowHistoryResponse;
}

export namespace WorkflowHistoryResponse {
  export type AsObject = {
    dataList: Array<ReplayData.AsObject>,
  }
}

export class ReplayData extends jspb.Message {
  getNodeid(): string;
  setNodeid(value: string): ReplayData;

  getData(): NodeData | undefined;
  setData(value?: NodeData): ReplayData;
  hasData(): boolean;
  clearData(): ReplayData;

  getVariablesMap(): jspb.Map<string, string>;
  clearVariablesMap(): ReplayData;

  getStatus(): NodeStatus;
  setStatus(value: NodeStatus): ReplayData;

  getMessage(): string;
  setMessage(value: string): ReplayData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplayData.AsObject;
  static toObject(includeInstance: boolean, msg: ReplayData): ReplayData.AsObject;
  static serializeBinaryToWriter(message: ReplayData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplayData;
  static deserializeBinaryFromReader(message: ReplayData, reader: jspb.BinaryReader): ReplayData;
}

export namespace ReplayData {
  export type AsObject = {
    nodeid: string,
    data?: NodeData.AsObject,
    variablesMap: Array<[string, string]>,
    status: NodeStatus,
    message: string,
  }
}

export class PageRequest extends jspb.Message {
  getLimit(): number;
  setLimit(value: number): PageRequest;

  getOffset(): number;
  setOffset(value: number): PageRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PageRequest): PageRequest.AsObject;
  static serializeBinaryToWriter(message: PageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PageRequest;
  static deserializeBinaryFromReader(message: PageRequest, reader: jspb.BinaryReader): PageRequest;
}

export namespace PageRequest {
  export type AsObject = {
    limit: number,
    offset: number,
  }
}

export class GetWorkflowRequest extends jspb.Message {
  getId(): string;
  setId(value: string): GetWorkflowRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetWorkflowRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetWorkflowRequest): GetWorkflowRequest.AsObject;
  static serializeBinaryToWriter(message: GetWorkflowRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetWorkflowRequest;
  static deserializeBinaryFromReader(message: GetWorkflowRequest, reader: jspb.BinaryReader): GetWorkflowRequest;
}

export namespace GetWorkflowRequest {
  export type AsObject = {
    id: string,
  }
}

export class WorkflowList extends jspb.Message {
  getTotal(): number;
  setTotal(value: number): WorkflowList;

  getWorkflowsList(): Array<Workflow>;
  setWorkflowsList(value: Array<Workflow>): WorkflowList;
  clearWorkflowsList(): WorkflowList;
  addWorkflows(value?: Workflow, index?: number): Workflow;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WorkflowList.AsObject;
  static toObject(includeInstance: boolean, msg: WorkflowList): WorkflowList.AsObject;
  static serializeBinaryToWriter(message: WorkflowList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WorkflowList;
  static deserializeBinaryFromReader(message: WorkflowList, reader: jspb.BinaryReader): WorkflowList;
}

export namespace WorkflowList {
  export type AsObject = {
    total: number,
    workflowsList: Array<Workflow.AsObject>,
  }
}

export class Workflow extends jspb.Message {
  getId(): string;
  setId(value: string): Workflow;

  getName(): string;
  setName(value: string): Workflow;

  getDescription(): string;
  setDescription(value: string): Workflow;

  getNodesList(): Array<Node>;
  setNodesList(value: Array<Node>): Workflow;
  clearNodesList(): Workflow;
  addNodes(value?: Node, index?: number): Node;

  getEdgesList(): Array<Edge>;
  setEdgesList(value: Array<Edge>): Workflow;
  clearEdgesList(): Workflow;
  addEdges(value?: Edge, index?: number): Edge;

  getType(): string;
  setType(value: string): Workflow;

  getCreatedat(): string;
  setCreatedat(value: string): Workflow;

  getUpdatedat(): string;
  setUpdatedat(value: string): Workflow;

  getCreatedby(): string;
  setCreatedby(value: string): Workflow;

  getUpdatedby(): string;
  setUpdatedby(value: string): Workflow;

  getTagsList(): Array<string>;
  setTagsList(value: Array<string>): Workflow;
  clearTagsList(): Workflow;
  addTags(value: string, index?: number): Workflow;

  getIsnew(): boolean;
  setIsnew(value: boolean): Workflow;
  hasIsnew(): boolean;
  clearIsnew(): Workflow;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Workflow.AsObject;
  static toObject(includeInstance: boolean, msg: Workflow): Workflow.AsObject;
  static serializeBinaryToWriter(message: Workflow, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Workflow;
  static deserializeBinaryFromReader(message: Workflow, reader: jspb.BinaryReader): Workflow;
}

export namespace Workflow {
  export type AsObject = {
    id: string,
    name: string,
    description: string,
    nodesList: Array<Node.AsObject>,
    edgesList: Array<Edge.AsObject>,
    type: string,
    createdat: string,
    updatedat: string,
    createdby: string,
    updatedby: string,
    tagsList: Array<string>,
    isnew?: boolean,
  }

  export enum IsnewCase { 
    _ISNEW_NOT_SET = 0,
    ISNEW = 12,
  }
}

export class Edge extends jspb.Message {
  getId(): string;
  setId(value: string): Edge;

  getType(): string;
  setType(value: string): Edge;

  getLabel(): string;
  setLabel(value: string): Edge;

  getTabid(): string;
  setTabid(value: string): Edge;

  getSource(): string;
  setSource(value: string): Edge;

  getTarget(): string;
  setTarget(value: string): Edge;

  getSourcex(): number;
  setSourcex(value: number): Edge;

  getSourcey(): number;
  setSourcey(value: number): Edge;

  getTargetx(): number;
  setTargetx(value: number): Edge;

  getTargety(): number;
  setTargety(value: number): Edge;

  getAnimated(): boolean;
  setAnimated(value: boolean): Edge;

  getSourcenode(): Node | undefined;
  setSourcenode(value?: Node): Edge;
  hasSourcenode(): boolean;
  clearSourcenode(): Edge;

  getTargetnode(): Node | undefined;
  setTargetnode(value?: Node): Edge;
  hasTargetnode(): boolean;
  clearTargetnode(): Edge;

  getSourcehandle(): string;
  setSourcehandle(value: string): Edge;

  getTargethandle(): string;
  setTargethandle(value: string): Edge;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Edge.AsObject;
  static toObject(includeInstance: boolean, msg: Edge): Edge.AsObject;
  static serializeBinaryToWriter(message: Edge, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Edge;
  static deserializeBinaryFromReader(message: Edge, reader: jspb.BinaryReader): Edge;
}

export namespace Edge {
  export type AsObject = {
    id: string,
    type: string,
    label: string,
    tabid: string,
    source: string,
    target: string,
    sourcex: number,
    sourcey: number,
    targetx: number,
    targety: number,
    animated: boolean,
    sourcenode?: Node.AsObject,
    targetnode?: Node.AsObject,
    sourcehandle: string,
    targethandle: string,
  }
}

export class Node extends jspb.Message {
  getId(): string;
  setId(value: string): Node;

  getNodetype(): string;
  setNodetype(value: string): Node;

  getLabel(): string;
  setLabel(value: string): Node;

  getData(): NodeData | undefined;
  setData(value?: NodeData): Node;
  hasData(): boolean;
  clearData(): Node;

  getGroupList(): Array<number>;
  setGroupList(value: Array<number>): Node;
  clearGroupList(): Node;
  addGroup(value: number, index?: number): Node;

  getNodestyle(): string;
  setNodestyle(value: string): Node;
  hasNodestyle(): boolean;
  clearNodestyle(): Node;

  getInputsList(): Array<string>;
  setInputsList(value: Array<string>): Node;
  clearInputsList(): Node;
  addInputs(value: string, index?: number): Node;

  getOutputsList(): Array<string>;
  setOutputsList(value: Array<string>): Node;
  clearOutputsList(): Node;
  addOutputs(value: string, index?: number): Node;

  getDraggable(): boolean;
  setDraggable(value: boolean): Node;
  hasDraggable(): boolean;
  clearDraggable(): Node;

  getIcon(): NodeIcon | undefined;
  setIcon(value?: NodeIcon): Node;
  hasIcon(): boolean;
  clearIcon(): Node;

  getPosition(): NodePosition | undefined;
  setPosition(value?: NodePosition): Node;
  hasPosition(): boolean;
  clearPosition(): Node;

  getNodestatus(): string;
  setNodestatus(value: string): Node;
  hasNodestatus(): boolean;
  clearNodestatus(): Node;

  getType(): string;
  setType(value: string): Node;
  hasType(): boolean;
  clearType(): Node;

  getDimensions(): NodeDimensions | undefined;
  setDimensions(value?: NodeDimensions): Node;
  hasDimensions(): boolean;
  clearDimensions(): Node;

  getHandlebounds(): NodeHandleBounds | undefined;
  setHandlebounds(value?: NodeHandleBounds): Node;
  hasHandlebounds(): boolean;
  clearHandlebounds(): Node;

  getComputedposition(): NodePosition | undefined;
  setComputedposition(value?: NodePosition): Node;
  hasComputedposition(): boolean;
  clearComputedposition(): Node;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Node.AsObject;
  static toObject(includeInstance: boolean, msg: Node): Node.AsObject;
  static serializeBinaryToWriter(message: Node, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Node;
  static deserializeBinaryFromReader(message: Node, reader: jspb.BinaryReader): Node;
}

export namespace Node {
  export type AsObject = {
    id: string,
    nodetype: string,
    label: string,
    data?: NodeData.AsObject,
    groupList: Array<number>,
    nodestyle?: string,
    inputsList: Array<string>,
    outputsList: Array<string>,
    draggable?: boolean,
    icon?: NodeIcon.AsObject,
    position?: NodePosition.AsObject,
    nodestatus?: string,
    type?: string,
    dimensions?: NodeDimensions.AsObject,
    handlebounds?: NodeHandleBounds.AsObject,
    computedposition?: NodePosition.AsObject,
  }

  export enum DataCase { 
    _DATA_NOT_SET = 0,
    DATA = 4,
  }

  export enum NodestyleCase { 
    _NODESTYLE_NOT_SET = 0,
    NODESTYLE = 6,
  }

  export enum DraggableCase { 
    _DRAGGABLE_NOT_SET = 0,
    DRAGGABLE = 9,
  }

  export enum IconCase { 
    _ICON_NOT_SET = 0,
    ICON = 10,
  }

  export enum PositionCase { 
    _POSITION_NOT_SET = 0,
    POSITION = 11,
  }

  export enum NodestatusCase { 
    _NODESTATUS_NOT_SET = 0,
    NODESTATUS = 12,
  }

  export enum TypeCase { 
    _TYPE_NOT_SET = 0,
    TYPE = 13,
  }
}

export class NodeData extends jspb.Message {
  getName(): string;
  setName(value: string): NodeData;
  hasName(): boolean;
  clearName(): NodeData;

  getValue(): string;
  setValue(value: string): NodeData;
  hasValue(): boolean;
  clearValue(): NodeData;

  getExpression(): string;
  setExpression(value: string): NodeData;
  hasExpression(): boolean;
  clearExpression(): NodeData;

  getIteration(): number;
  setIteration(value: number): NodeData;
  hasIteration(): boolean;
  clearIteration(): NodeData;

  getListvar(): string;
  setListvar(value: string): NodeData;
  hasListvar(): boolean;
  clearListvar(): NodeData;

  getLimit(): number;
  setLimit(value: number): NodeData;
  hasLimit(): boolean;
  clearLimit(): NodeData;

  getUrl(): string;
  setUrl(value: string): NodeData;
  hasUrl(): boolean;
  clearUrl(): NodeData;

  getMethod(): string;
  setMethod(value: string): NodeData;
  hasMethod(): boolean;
  clearMethod(): NodeData;

  getHeaders(): NodeDataArray | undefined;
  setHeaders(value?: NodeDataArray): NodeData;
  hasHeaders(): boolean;
  clearHeaders(): NodeData;

  getPayload(): string;
  setPayload(value: string): NodeData;
  hasPayload(): boolean;
  clearPayload(): NodeData;

  getVariable(): string;
  setVariable(value: string): NodeData;
  hasVariable(): boolean;
  clearVariable(): NodeData;

  getMessage(): string;
  setMessage(value: string): NodeData;
  hasMessage(): boolean;
  clearMessage(): NodeData;

  getList(): NodeDataArray | undefined;
  setList(value?: NodeDataArray): NodeData;
  hasList(): boolean;
  clearList(): NodeData;

  getListvariable(): string;
  setListvariable(value: string): NodeData;
  hasListvariable(): boolean;
  clearListvariable(): NodeData;

  getTemplate(): string;
  setTemplate(value: string): NodeData;
  hasTemplate(): boolean;
  clearTemplate(): NodeData;

  getText(): string;
  setText(value: string): NodeData;
  hasText(): boolean;
  clearText(): NodeData;

  getPattern(): string;
  setPattern(value: string): NodeData;
  hasPattern(): boolean;
  clearPattern(): NodeData;

  getReplacetext(): string;
  setReplacetext(value: string): NodeData;
  hasReplacetext(): boolean;
  clearReplacetext(): NodeData;

  getSubprocessid(): string;
  setSubprocessid(value: string): NodeData;
  hasSubprocessid(): boolean;
  clearSubprocessid(): NodeData;

  getType(): string;
  setType(value: string): NodeData;
  hasType(): boolean;
  clearType(): NodeData;

  getInterval(): number;
  setInterval(value: number): NodeData;
  hasInterval(): boolean;
  clearInterval(): NodeData;

  getWeeks(): NodeDataArray | undefined;
  setWeeks(value?: NodeDataArray): NodeData;
  hasWeeks(): boolean;
  clearWeeks(): NodeData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeData.AsObject;
  static toObject(includeInstance: boolean, msg: NodeData): NodeData.AsObject;
  static serializeBinaryToWriter(message: NodeData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeData;
  static deserializeBinaryFromReader(message: NodeData, reader: jspb.BinaryReader): NodeData;
}

export namespace NodeData {
  export type AsObject = {
    name?: string,
    value?: string,
    expression?: string,
    iteration?: number,
    listvar?: string,
    limit?: number,
    url?: string,
    method?: string,
    headers?: NodeDataArray.AsObject,
    payload?: string,
    variable?: string,
    message?: string,
    list?: NodeDataArray.AsObject,
    listvariable?: string,
    template?: string,
    text?: string,
    pattern?: string,
    replacetext?: string,
    subprocessid?: string,
    type?: string,
    interval?: number,
    weeks?: NodeDataArray.AsObject,
  }

  export enum NameCase { 
    _NAME_NOT_SET = 0,
    NAME = 1,
  }

  export enum ValueCase { 
    _VALUE_NOT_SET = 0,
    VALUE = 2,
  }

  export enum ExpressionCase { 
    _EXPRESSION_NOT_SET = 0,
    EXPRESSION = 3,
  }

  export enum IterationCase { 
    _ITERATION_NOT_SET = 0,
    ITERATION = 4,
  }

  export enum ListvarCase { 
    _LISTVAR_NOT_SET = 0,
    LISTVAR = 5,
  }

  export enum LimitCase { 
    _LIMIT_NOT_SET = 0,
    LIMIT = 6,
  }

  export enum UrlCase { 
    _URL_NOT_SET = 0,
    URL = 7,
  }

  export enum MethodCase { 
    _METHOD_NOT_SET = 0,
    METHOD = 8,
  }

  export enum HeadersCase { 
    _HEADERS_NOT_SET = 0,
    HEADERS = 9,
  }

  export enum PayloadCase { 
    _PAYLOAD_NOT_SET = 0,
    PAYLOAD = 10,
  }

  export enum VariableCase { 
    _VARIABLE_NOT_SET = 0,
    VARIABLE = 11,
  }

  export enum MessageCase { 
    _MESSAGE_NOT_SET = 0,
    MESSAGE = 12,
  }

  export enum ListCase { 
    _LIST_NOT_SET = 0,
    LIST = 13,
  }

  export enum ListvariableCase { 
    _LISTVARIABLE_NOT_SET = 0,
    LISTVARIABLE = 14,
  }

  export enum TemplateCase { 
    _TEMPLATE_NOT_SET = 0,
    TEMPLATE = 15,
  }

  export enum TextCase { 
    _TEXT_NOT_SET = 0,
    TEXT = 16,
  }

  export enum PatternCase { 
    _PATTERN_NOT_SET = 0,
    PATTERN = 17,
  }

  export enum ReplacetextCase { 
    _REPLACETEXT_NOT_SET = 0,
    REPLACETEXT = 18,
  }

  export enum SubprocessidCase { 
    _SUBPROCESSID_NOT_SET = 0,
    SUBPROCESSID = 19,
  }

  export enum TypeCase { 
    _TYPE_NOT_SET = 0,
    TYPE = 20,
  }

  export enum IntervalCase { 
    _INTERVAL_NOT_SET = 0,
    INTERVAL = 21,
  }

  export enum WeeksCase { 
    _WEEKS_NOT_SET = 0,
    WEEKS = 22,
  }
}

export class NodeDataArray extends jspb.Message {
  getType(): ArrayDataType;
  setType(value: ArrayDataType): NodeDataArray;

  getKeyvalueitemsList(): Array<KeyValue>;
  setKeyvalueitemsList(value: Array<KeyValue>): NodeDataArray;
  clearKeyvalueitemsList(): NodeDataArray;
  addKeyvalueitems(value?: KeyValue, index?: number): KeyValue;

  getStringitemsList(): Array<string>;
  setStringitemsList(value: Array<string>): NodeDataArray;
  clearStringitemsList(): NodeDataArray;
  addStringitems(value: string, index?: number): NodeDataArray;

  getIntitemsList(): Array<number>;
  setIntitemsList(value: Array<number>): NodeDataArray;
  clearIntitemsList(): NodeDataArray;
  addIntitems(value: number, index?: number): NodeDataArray;

  getBoolitemsList(): Array<boolean>;
  setBoolitemsList(value: Array<boolean>): NodeDataArray;
  clearBoolitemsList(): NodeDataArray;
  addBoolitems(value: boolean, index?: number): NodeDataArray;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeDataArray.AsObject;
  static toObject(includeInstance: boolean, msg: NodeDataArray): NodeDataArray.AsObject;
  static serializeBinaryToWriter(message: NodeDataArray, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeDataArray;
  static deserializeBinaryFromReader(message: NodeDataArray, reader: jspb.BinaryReader): NodeDataArray;
}

export namespace NodeDataArray {
  export type AsObject = {
    type: ArrayDataType,
    keyvalueitemsList: Array<KeyValue.AsObject>,
    stringitemsList: Array<string>,
    intitemsList: Array<number>,
    boolitemsList: Array<boolean>,
  }
}

export class NodeIcon extends jspb.Message {
  getName(): string;
  setName(value: string): NodeIcon;

  getColor(): string;
  setColor(value: string): NodeIcon;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeIcon.AsObject;
  static toObject(includeInstance: boolean, msg: NodeIcon): NodeIcon.AsObject;
  static serializeBinaryToWriter(message: NodeIcon, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeIcon;
  static deserializeBinaryFromReader(message: NodeIcon, reader: jspb.BinaryReader): NodeIcon;
}

export namespace NodeIcon {
  export type AsObject = {
    name: string,
    color: string,
  }
}

export class NodeDimensions extends jspb.Message {
  getWidth(): number;
  setWidth(value: number): NodeDimensions;

  getHeight(): number;
  setHeight(value: number): NodeDimensions;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeDimensions.AsObject;
  static toObject(includeInstance: boolean, msg: NodeDimensions): NodeDimensions.AsObject;
  static serializeBinaryToWriter(message: NodeDimensions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeDimensions;
  static deserializeBinaryFromReader(message: NodeDimensions, reader: jspb.BinaryReader): NodeDimensions;
}

export namespace NodeDimensions {
  export type AsObject = {
    width: number,
    height: number,
  }
}

export class NodePosition extends jspb.Message {
  getX(): number;
  setX(value: number): NodePosition;

  getY(): number;
  setY(value: number): NodePosition;

  getZ(): number;
  setZ(value: number): NodePosition;
  hasZ(): boolean;
  clearZ(): NodePosition;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodePosition.AsObject;
  static toObject(includeInstance: boolean, msg: NodePosition): NodePosition.AsObject;
  static serializeBinaryToWriter(message: NodePosition, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodePosition;
  static deserializeBinaryFromReader(message: NodePosition, reader: jspb.BinaryReader): NodePosition;
}

export namespace NodePosition {
  export type AsObject = {
    x: number,
    y: number,
    z?: number,
  }

  export enum ZCase { 
    _Z_NOT_SET = 0,
    Z = 3,
  }
}

export class KeyValue extends jspb.Message {
  getKey(): string;
  setKey(value: string): KeyValue;

  getValue(): string;
  setValue(value: string): KeyValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyValue.AsObject;
  static toObject(includeInstance: boolean, msg: KeyValue): KeyValue.AsObject;
  static serializeBinaryToWriter(message: KeyValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyValue;
  static deserializeBinaryFromReader(message: KeyValue, reader: jspb.BinaryReader): KeyValue;
}

export namespace KeyValue {
  export type AsObject = {
    key: string,
    value: string,
  }
}

export class NodeHandleBounds extends jspb.Message {
  getSourceList(): Array<Handle>;
  setSourceList(value: Array<Handle>): NodeHandleBounds;
  clearSourceList(): NodeHandleBounds;
  addSource(value?: Handle, index?: number): Handle;

  getTargetList(): Array<Handle>;
  setTargetList(value: Array<Handle>): NodeHandleBounds;
  clearTargetList(): NodeHandleBounds;
  addTarget(value?: Handle, index?: number): Handle;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeHandleBounds.AsObject;
  static toObject(includeInstance: boolean, msg: NodeHandleBounds): NodeHandleBounds.AsObject;
  static serializeBinaryToWriter(message: NodeHandleBounds, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeHandleBounds;
  static deserializeBinaryFromReader(message: NodeHandleBounds, reader: jspb.BinaryReader): NodeHandleBounds;
}

export namespace NodeHandleBounds {
  export type AsObject = {
    sourceList: Array<Handle.AsObject>,
    targetList: Array<Handle.AsObject>,
  }
}

export class Handle extends jspb.Message {
  getX(): number;
  setX(value: number): Handle;

  getY(): number;
  setY(value: number): Handle;

  getId(): string;
  setId(value: string): Handle;

  getType(): string;
  setType(value: string): Handle;

  getWidth(): number;
  setWidth(value: number): Handle;

  getHeight(): number;
  setHeight(value: number): Handle;

  getNodeid(): string;
  setNodeid(value: string): Handle;

  getPosition(): string;
  setPosition(value: string): Handle;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Handle.AsObject;
  static toObject(includeInstance: boolean, msg: Handle): Handle.AsObject;
  static serializeBinaryToWriter(message: Handle, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Handle;
  static deserializeBinaryFromReader(message: Handle, reader: jspb.BinaryReader): Handle;
}

export namespace Handle {
  export type AsObject = {
    x: number,
    y: number,
    id: string,
    type: string,
    width: number,
    height: number,
    nodeid: string,
    position: string,
  }
}

export enum ArrayDataType { 
  STRING = 0,
  INT = 1,
  BOOL = 2,
  KEYVALUE = 3,
}
export enum NodeStatus { 
  RUNNING = 0,
  COMPLETED = 1,
  FAILED = 2,
  INFO = 3,
}
