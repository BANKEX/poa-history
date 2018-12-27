package server

import (
	"github.com/bankex/poa-history/config"
	"github.com/gin-gonic/contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/swaggo/gin-swagger"
	"github.com/swaggo/gin-swagger/swaggerFiles"
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

	s := ServerInstance{
		Engine: r,
		Config: cfg,
	}

	return &s
}

func Serve(s *ServerInstance) {
	r := s.Engine
	cfg := s.Config

	a := r.Group("/a", gin.BasicAuth(gin.Accounts{
		cfg.Login: cfg.Password,
	}))

	a.POST("/new/:assetId/:hash", s.CreateAssetID)
	a.POST("/update/:assetId/:hash", s.UpdateAssetByID)
	r.GET("/get/:assetId/:txNumber", s.ReturnSpecificAsset)
	r.GET("/proof/:assetId/:txNumber/:hash/:timestamp", s.ReturnMerkleProof)
	r.GET("/list", s.ReturnAllAssets)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.Run(cfg.ServerPort)
}

func (s *ServerInstance) CreateAssetID(c *gin.Context) {

}

func (s *ServerInstance) UpdateAssetByID(c *gin.Context) {

}

func (s *ServerInstance) ReturnAllAssets(c *gin.Context) {

}

func (s *ServerInstance) ReturnSpecificAsset(c *gin.Context) {

}

func (s *ServerInstance) ReturnMerkleProof(c *gin.Context) {

}
