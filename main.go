package main

import (
	"github.com/gin-gonic/gin"
)

func main() {



	r := gin.Default()

	r.Static("/assets/main", "./assets/main")
	r.Static("/assets/upload", "./assets/upload")
	r.Static("/assets/download", "./assets/download")

	//r.GET("/", func(c *gin.Context) {
	//	c.Redirect(301, "http://ec2-18-210-150-89.compute-1.amazonaws.com:80/assets/main/")
	//})
	r.GET("/", func(c *gin.Context) {
		c.Redirect(301, "http://localhost:8080/assets/main/")
	})


	r.Run(":8080") // listen and serve on 0.0.0.0:8080
}
