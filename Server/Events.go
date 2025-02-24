package main

import (
	"fmt"
	"log"
	"sync"
)

func newEventStream() *EventStream {
	log.Default().Println("Creating new event stream")
	return &EventStream{
		clients: make(map[string]chan StreamMessage),
		mu:      sync.Mutex{},
	}
}

func (es *EventStream) addClient(id string) {
	log.Default().Printf("Adding client %s to event stream\n", id)
	es.mu.Lock()
	defer es.mu.Unlock()
	es.clients[id] = make(chan StreamMessage)
}

func (es *EventStream) removeClient(id string) {
	log.Default().Printf("Removing client %s from event stream\n", id)
	es.mu.Lock()
	defer es.mu.Unlock()
	delete(es.clients, id)
}

func (es *EventStream) SendEvent(clientID string, eventType string, msg string) {
	es.mu.Lock()
	defer es.mu.Unlock()
	if ch, ok := es.clients[clientID]; ok {
		ch <- StreamMessage{Event: eventType, Data: StreamData{Obj: msg}}
	} else {
		fmt.Printf("Client %s not found.\n", clientID)
	}
}
