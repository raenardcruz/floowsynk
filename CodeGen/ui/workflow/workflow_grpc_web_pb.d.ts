import * as grpcWeb from 'grpc-web';

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"
import * as workflow_pb from './workflow_pb'; // proto import: "workflow.proto"


export class WorkflowServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getWorkflow(
    request: workflow_pb.GetWorkflowRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.Workflow) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.Workflow>;

  listWorkflows(
    request: workflow_pb.PageRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.WorkflowList) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.WorkflowList>;

  updateWorkflow(
    request: workflow_pb.Workflow,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.Workflow) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.Workflow>;

  createWorkflow(
    request: workflow_pb.Workflow,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.Workflow) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.Workflow>;

  deleteWorkflow(
    request: workflow_pb.Workflow,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  quickRun(
    request: workflow_pb.Workflow,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<workflow_pb.ReplayData>;

  runWorkflowId(
    request: workflow_pb.RunWorkflowIdRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<workflow_pb.ReplayData>;

  listWorkflowHistory(
    request: workflow_pb.ListWorkflowHistoryRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.WorkflowHistoryList) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.WorkflowHistoryList>;

  getWorkflowHistory(
    request: workflow_pb.WorkflowHistoryRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.WorkflowHistoryResponse) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.WorkflowHistoryResponse>;

  listConnectorTemplates(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.ConnectorTemplateList) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.ConnectorTemplateList>;

  listConnections(
    request: workflow_pb.ListConnectionsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.ConnectionList) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.ConnectionList>;

  deleteConnection(
    request: workflow_pb.DeleteConnectionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  listWorkflowVersions(
    request: workflow_pb.GetWorkflowVersionsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.WorkflowVersionList) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.WorkflowVersionList>;

  restoreWorkflowVersion(
    request: workflow_pb.WorkflowVersion,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.Workflow) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.Workflow>;

  publishWorkflow(
    request: workflow_pb.PublishWorkflowRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.PublishWorkflowResponse) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.PublishWorkflowResponse>;

  revertWorkflowToStaging(
    request: workflow_pb.GetWorkflowRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.Workflow) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.Workflow>;

  listRagConnections(
    request: workflow_pb.ListRagConnectionsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.RagConnectionList) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.RagConnectionList>;

  createRagConnection(
    request: workflow_pb.CreateRagConnectionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.RagConnectionProto) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.RagConnectionProto>;

  updateRagConnection(
    request: workflow_pb.UpdateRagConnectionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.RagConnectionProto) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.RagConnectionProto>;

  deleteRagConnection(
    request: workflow_pb.DeleteRagConnectionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  listRagDocuments(
    request: workflow_pb.ListRagDocumentsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.RagDocumentList) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.RagDocumentList>;

  uploadRagDocument(
    request: workflow_pb.UploadRagDocumentRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.RagDocumentProto) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.RagDocumentProto>;

  deleteRagDocument(
    request: workflow_pb.DeleteRagDocumentRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  queryRag(
    request: workflow_pb.QueryRagRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: workflow_pb.QueryRagResponse) => void
  ): grpcWeb.ClientReadableStream<workflow_pb.QueryRagResponse>;

}

export class WorkflowServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getWorkflow(
    request: workflow_pb.GetWorkflowRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.Workflow>;

  listWorkflows(
    request: workflow_pb.PageRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.WorkflowList>;

  updateWorkflow(
    request: workflow_pb.Workflow,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.Workflow>;

  createWorkflow(
    request: workflow_pb.Workflow,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.Workflow>;

  deleteWorkflow(
    request: workflow_pb.Workflow,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  quickRun(
    request: workflow_pb.Workflow,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<workflow_pb.ReplayData>;

  runWorkflowId(
    request: workflow_pb.RunWorkflowIdRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<workflow_pb.ReplayData>;

  listWorkflowHistory(
    request: workflow_pb.ListWorkflowHistoryRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.WorkflowHistoryList>;

  getWorkflowHistory(
    request: workflow_pb.WorkflowHistoryRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.WorkflowHistoryResponse>;

  listConnectorTemplates(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.ConnectorTemplateList>;

  listConnections(
    request: workflow_pb.ListConnectionsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.ConnectionList>;

  deleteConnection(
    request: workflow_pb.DeleteConnectionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  listWorkflowVersions(
    request: workflow_pb.GetWorkflowVersionsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.WorkflowVersionList>;

  restoreWorkflowVersion(
    request: workflow_pb.WorkflowVersion,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.Workflow>;

  publishWorkflow(
    request: workflow_pb.PublishWorkflowRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.PublishWorkflowResponse>;

  revertWorkflowToStaging(
    request: workflow_pb.GetWorkflowRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.Workflow>;

  listRagConnections(
    request: workflow_pb.ListRagConnectionsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.RagConnectionList>;

  createRagConnection(
    request: workflow_pb.CreateRagConnectionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.RagConnectionProto>;

  updateRagConnection(
    request: workflow_pb.UpdateRagConnectionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.RagConnectionProto>;

  deleteRagConnection(
    request: workflow_pb.DeleteRagConnectionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  listRagDocuments(
    request: workflow_pb.ListRagDocumentsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.RagDocumentList>;

  uploadRagDocument(
    request: workflow_pb.UploadRagDocumentRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.RagDocumentProto>;

  deleteRagDocument(
    request: workflow_pb.DeleteRagDocumentRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  queryRag(
    request: workflow_pb.QueryRagRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.QueryRagResponse>;

}

