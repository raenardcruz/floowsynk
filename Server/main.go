package main

import (
	"log"
	"net/http"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/raenardcruz/floowsynk/db"
	"github.com/raenardcruz/floowsynk/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

type LoginServer struct {
	proto.UnimplementedLoginServiceServer
}

type WorkflowServer struct {
	proto.UnimplementedWorkflowServiceServer
}

func main() {
	dbobj, err := db.NewDB()
	if err != nil {
		panic(err)
	}
	defer dbobj.Close()
	dbobj.InitDB()
	dbcon = DBConnection{dbobj}
	grpcServer := grpc.NewServer()
	proto.RegisterLoginServiceServer(grpcServer, &LoginServer{})
	proto.RegisterWorkflowServiceServer(grpcServer, &WorkflowServer{})
	reflection.Register(grpcServer)
	wrap := grpcweb.WrapServer(grpcServer)
	httpServer := http.NewServeMux()
	httpServer.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		wrap.ServeHTTP(w, r)
	})

	log.Println("Server started at :8080")
	if err := http.ListenAndServe(":8080", corsMiddleware(httpServer)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func corsMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-agent, x-grpc-web")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		h.ServeHTTP(w, r)
	})
}
