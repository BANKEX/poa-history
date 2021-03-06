package models

const (
	CollectionTree = "tree"
)

// Tree model
type Tree struct {
	TreeKeys    []string          `json:"TreeKeys" bson:"TreeKeys"`
	TreeContent map[string][]byte `json:"TreeContent" bson:"TreeContent"`
	Having      bool              `json:"having" bson:"having"`
	TreeId      string            `json:"TreeId" bson:"TreeId"`
}
