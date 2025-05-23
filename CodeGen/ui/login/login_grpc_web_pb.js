/**
 * @fileoverview gRPC-Web generated client stub for proto
 * @enhanceable
 * @public
 */

// Code generated by protoc-gen-grpc-web. DO NOT EDIT.
// versions:
// 	protoc-gen-grpc-web v1.5.0
// 	protoc              v3.21.12
// source: login.proto


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');


var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js')
const proto = {};
proto.proto = require('./login_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.proto.LoginServiceClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options.format = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname.replace(/\/+$/, '');

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.proto.LoginServicePromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options.format = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname.replace(/\/+$/, '');

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.proto.Credential,
 *   !proto.proto.Token>}
 */
const methodDescriptor_LoginService_Login = new grpc.web.MethodDescriptor(
  '/proto.LoginService/Login',
  grpc.web.MethodType.UNARY,
  proto.proto.Credential,
  proto.proto.Token,
  /**
   * @param {!proto.proto.Credential} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.proto.Token.deserializeBinary
);


/**
 * @param {!proto.proto.Credential} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.proto.Token)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.proto.Token>|undefined}
 *     The XHR Node Readable Stream
 */
proto.proto.LoginServiceClient.prototype.login =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/proto.LoginService/Login',
      request,
      metadata || {},
      methodDescriptor_LoginService_Login,
      callback);
};


/**
 * @param {!proto.proto.Credential} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.proto.Token>}
 *     Promise that resolves to the response
 */
proto.proto.LoginServicePromiseClient.prototype.login =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/proto.LoginService/Login',
      request,
      metadata || {},
      methodDescriptor_LoginService_Login);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.google.protobuf.Empty,
 *   !proto.proto.Token>}
 */
const methodDescriptor_LoginService_ExtendToken = new grpc.web.MethodDescriptor(
  '/proto.LoginService/ExtendToken',
  grpc.web.MethodType.UNARY,
  google_protobuf_empty_pb.Empty,
  proto.proto.Token,
  /**
   * @param {!proto.google.protobuf.Empty} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.proto.Token.deserializeBinary
);


/**
 * @param {!proto.google.protobuf.Empty} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.proto.Token)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.proto.Token>|undefined}
 *     The XHR Node Readable Stream
 */
proto.proto.LoginServiceClient.prototype.extendToken =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/proto.LoginService/ExtendToken',
      request,
      metadata || {},
      methodDescriptor_LoginService_ExtendToken,
      callback);
};


/**
 * @param {!proto.google.protobuf.Empty} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.proto.Token>}
 *     Promise that resolves to the response
 */
proto.proto.LoginServicePromiseClient.prototype.extendToken =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/proto.LoginService/ExtendToken',
      request,
      metadata || {},
      methodDescriptor_LoginService_ExtendToken);
};


module.exports = proto.proto;

