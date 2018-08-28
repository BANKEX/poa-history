package content

import (
	"../../../ethercrypto/hashing"
	"../../../models"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"github.com/gin-gonic/gin"
	"encoding/hex"
)

const TREE_ID = "1"

func AddContent(c *gin.Context, txNumber int64, timestamp int64) {
	if checkContent(c) {
		key := CreateKey(c, txNumber)
		updateKey(c, key)
		content := GenContent(c, timestamp)
		println("CONTENT")
		println(hex.EncodeToString(content))
		updateContent(c, key, content)
	} else {
		m := make(map[string][]byte)
		key:= CreateKey(c, txNumber)
		var keys []string
		keys = append(keys, key)
		content := GenContent(c, timestamp)
		m[key] = content
		createContent(c, keys, m)
	}

}

func CreateKey(c *gin.Context, txNumber int64) string {
	key := hex.EncodeToString(hashing.CellCreation(c.Param("assetId"), txNumber))
	println("WHAT IS KEY")
	println((key))
	return key
}

func GenContent(c *gin.Context, timestamp int64) []byte {
	hash := hashing.CellCreation(c.Param("hash"), timestamp)
	println("WHAT IS GENERATING")
	println(hex.EncodeToString(hash))
	return hash
}

func GetAllKeys(c *gin.Context) []string {
	db := c.MustGet("test").(*mgo.Database)
	query := bson.M{"TreeId": TREE_ID}
	tree := models.Tree{}
	err := db.C(models.CollectionTree).Find(query).One(&tree)
	if err != nil {
		println("GetAllKeys error", err)
	}
	return tree.TreeKeys
}

func GetAllContent(c *gin.Context) map[string][]byte {
	db := c.MustGet("test").(*mgo.Database)
	query := bson.M{"TreeId": TREE_ID}
	tree := models.Tree{}
	err := db.C(models.CollectionTree).Find(query).One(&tree)
	if err != nil {
		println("GetAllContent error", err)
	}
	return tree.TreeContent
}

func updateKey(c *gin.Context, newKey string) {
	key := GetAllKeys(c)
	key = append(key, newKey)
	db := c.MustGet("test").(*mgo.Database)
	query := bson.M{"TreeId": TREE_ID}
	var result bson.M
	changeInDocument := mgo.Change{
		Update: bson.M{"$set": bson.M{"TreeKeys": key}},
	}
	_, err := db.C(models.CollectionTree).Find(query).Apply(changeInDocument, &result)
	if err != nil {
		println("updateKey mistake 1")
	}
}

func updateContent(c *gin.Context, newKey string, newContent []byte) {
	content := GetAllContent(c)
	content[newKey] = newContent
	db := c.MustGet("test").(*mgo.Database)
	query := bson.M{"TreeId": TREE_ID}
	var result bson.M
	changeInDocument := mgo.Change{
		Update: bson.M{"$set": bson.M{"TreeContent": content}},
	}
	_, err := db.C(models.CollectionTree).Find(query).Apply(changeInDocument, &result)
	if err != nil {
		println("updateContent mistake 1")
	}
}

func createContent(c *gin.Context, key []string, content map[string][]byte) {
	db := c.MustGet("test").(*mgo.Database)
	tree := models.Tree{}
	tree.TreeContent = content
	tree.TreeKeys = key
	tree.Having = true
	tree.TreeId = TREE_ID
	err := db.C(models.CollectionTree).Insert(tree)
	if err != nil {
		println("createContent mistake 1")
	}
}

func checkContent(c *gin.Context) bool {
	db := c.MustGet("test").(*mgo.Database)
	query := bson.M{"TreeId": TREE_ID}
	tree := models.Tree{}
	err := db.C(models.CollectionTree).Find(query).One(&tree)
	if err != nil {
		println("findTree error", err)
	}
	return tree.Having
}
