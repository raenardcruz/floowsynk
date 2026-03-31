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
    request: google_protobuf_empty_pb.Empty,
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
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.WorkflowHistoryList>;

  getWorkflowHistory(
    request: workflow_pb.WorkflowHistoryRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<workflow_pb.WorkflowHistoryResponse>;

}

