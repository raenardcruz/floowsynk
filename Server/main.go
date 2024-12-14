package main

import (
	"github.com/raenardcruz/floowsynk/db"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	dbobj, err := db.NewDB()
	if err != nil {
		panic(err)
	}
	defer dbobj.Close()
	dbobj.InitDB()

	r.POST("/api/login", Login)
	r.GET("/api/protected", Protected)

	r.Run(":8080")
}
