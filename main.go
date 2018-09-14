package main

import (
	"github.com/gin-gonic/gin"
)

func main() {

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.Redirect(301, "https://history.bankex.team/assets/main/")
	})
	r.Static("/assets/main", "./assets/main")
	r.Static("/assets/upload", "./assets/upload")
	r.Static("/assets/download", "./assets/download")

	r.Run(":7070")
}
