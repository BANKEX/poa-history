package server

import (
	"github.com/BANKEX/poa-history/server/db/middlewares"
	"github.com/gin-gonic/contrib/cors"
	"github.com/gin-gonic/gin"
)

type ServerInstance struct {
	Engine *gin.Engine
	Config *config.Config
}

func InitServer(cfg *config.Config) *ServerInstance {
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(cors.Default())
	r.Use(middlewares.Connect)
	r.Use(middlewares.ErrorHandler)

	si := ServerInstance{
		Engine: r,
		Config: cfg,
	}

	return &si
}

func RunServer(si *ServerInstance) {

	r := si.Engine
	cfg := si.Config

	//a := r.Group("/a", gin.BasicAuth(gin.Accounts{
	//	cfg.Login: cfg.Password,
	//}))
	//
	//a.POST("/new/:assetId/:hash", handlers.CreateAssetId)
	//a.POST("/update/:assetId/:hash", handlers.UpdateAssetId)
	//r.GET("/get/:assetId/:txNumber", handlers.GetData)
	//r.GET("/proof/:assetId/:txNumber/:hash/:timestamp", handlers.GetTotalProof)
	//r.GET("/list", handlers.List)
	//r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.Run(cfg.ServerPort)
}
