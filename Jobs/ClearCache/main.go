package main

import (
	"context"

	db "github.com/raenardcruz/floowsynk/Database"
)

func main() {
	ctx := context.Background()
	err := db.ClearCache(ctx)
	if err != nil {
		panic(err)
	}
}
