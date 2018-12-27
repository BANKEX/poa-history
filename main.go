package main

import (
	"github.com/BANKEX/poa-history/config"
	"github.com/BANKEX/poa-history/server"
)

func main() {

	// @title Swagger History API
	// @version 1.0
	// @description This is POA History swagger documentation

	// @contact.name API Support
	// @contact.email nk@bankexfoundation.org

	// @license.name MIT
	// @license.url https://opensource.org/licenses/MIT

	// @host history.bankex.team:8080
	// @BasePath /

	cfg := config.GetConfig()
	server.RunServer(server.Serve(cfg))

}
