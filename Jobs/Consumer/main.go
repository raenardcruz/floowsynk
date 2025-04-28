package main

import "github.com/raenardcruz/floowsynk/Broker/kafka"

func main() {
	kafka.ConnectConsumer([]string{"localhost:9092"})
}
