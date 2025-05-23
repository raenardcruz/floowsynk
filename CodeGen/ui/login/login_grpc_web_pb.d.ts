import * as grpcWeb from 'grpc-web';

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"
import * as login_pb from './login_pb'; // proto import: "login.proto"


export class LoginServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  login(
    request: login_pb.Credential,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: login_pb.Token) => void
  ): grpcWeb.ClientReadableStream<login_pb.Token>;

  extendToken(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: login_pb.Token) => void
  ): grpcWeb.ClientReadableStream<login_pb.Token>;

}

export class LoginServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  login(
    request: login_pb.Credential,
    metadata?: grpcWeb.Metadata
  ): Promise<login_pb.Token>;

  extendToken(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<login_pb.Token>;

}

