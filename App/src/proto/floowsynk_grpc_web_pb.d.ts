import * as grpcWeb from 'grpc-web';

import * as floowsynk_pb from './floowsynk_pb'; // proto import: "floowsynk.proto"


export class LoginServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  login(
    request: floowsynk_pb.Credential,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: floowsynk_pb.Token) => void
  ): grpcWeb.ClientReadableStream<floowsynk_pb.Token>;

  extendToken(
    request: floowsynk_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: floowsynk_pb.Token) => void
  ): grpcWeb.ClientReadableStream<floowsynk_pb.Token>;

}

export class WorkflowServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getWorkflow(
    request: floowsynk_pb.GetWorkflowRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: floowsynk_pb.Workflow) => void
  ): grpcWeb.ClientReadableStream<floowsynk_pb.Workflow>;

  listWorkflows(
    request: floowsynk_pb.PageRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: floowsynk_pb.WorkflowList) => void
  ): grpcWeb.ClientReadableStream<floowsynk_pb.WorkflowList>;

  updateWorkflow(
    request: floowsynk_pb.Workflow,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: floowsynk_pb.Workflow) => void
  ): grpcWeb.ClientReadableStream<floowsynk_pb.Workflow>;

  createWorkflow(
    request: floowsynk_pb.Workflow,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: floowsynk_pb.Workflow) => void
  ): grpcWeb.ClientReadableStream<floowsynk_pb.Workflow>;

  deleteWorkflow(
    request: floowsynk_pb.Workflow,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: floowsynk_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<floowsynk_pb.Empty>;

  quickRun(
    request: floowsynk_pb.Workflow,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<floowsynk_pb.RunWorkflowResponse>;

  runWorkflowId(
    request: floowsynk_pb.RunWorkflowIdRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<floowsynk_pb.RunWorkflowResponse>;

}

export class LoginServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  login(
    request: floowsynk_pb.Credential,
    metadata?: grpcWeb.Metadata
  ): Promise<floowsynk_pb.Token>;

  extendToken(
    request: floowsynk_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<floowsynk_pb.Token>;

}

export class WorkflowServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getWorkflow(
    request: floowsynk_pb.GetWorkflowRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<floowsynk_pb.Workflow>;

  listWorkflows(
    request: floowsynk_pb.PageRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<floowsynk_pb.WorkflowList>;

  updateWorkflow(
    request: floowsynk_pb.Workflow,
    metadata?: grpcWeb.Metadata
  ): Promise<floowsynk_pb.Workflow>;

  createWorkflow(
    request: floowsynk_pb.Workflow,
    metadata?: grpcWeb.Metadata
  ): Promise<floowsynk_pb.Workflow>;

  deleteWorkflow(
    request: floowsynk_pb.Workflow,
    metadata?: grpcWeb.Metadata
  ): Promise<floowsynk_pb.Empty>;

  quickRun(
    request: floowsynk_pb.Workflow,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<floowsynk_pb.RunWorkflowResponse>;

  runWorkflowId(
    request: floowsynk_pb.RunWorkflowIdRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<floowsynk_pb.RunWorkflowResponse>;

}

