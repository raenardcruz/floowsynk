package main

import (
	"flowsync/db"

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

	r.POST("/login", Login)
	r.GET("/protected", Protected)

	r.Run(":8080")
}
