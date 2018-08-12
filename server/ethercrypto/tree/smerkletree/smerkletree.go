// Copyright 2017 Cameron Bergoon
// Licensed under the MIT License, see LICENCE file for details.

package smerkletree

import (
	"bytes"
	"errors"
	"fmt"
	"github.com/miguelmota/go-solidity-sha3"
	"encoding/hex"
)

//Content represents the data that is stored and verified by the tree. A type that
//implements this interface can be used as an item in the tree.
type Content interface {
	CalculateHashBytes() ([]byte, error)
	Equals(other Content) (bool, error)
}

//MerkleTree is the container for the tree. It holds a pointer to the root of the tree,
//a list of pointers to the leaf nodes, and the merkle root.
type MerkleTree struct {
	Root       *Node
	merkleRoot []byte
	Leafs      []*Node
}

//Node represents a node, root, or leaf in the tree. It stores pointers to its immediate
//relationships, a hash, the content stored if it is a leaf, and other metadata.
type Node struct {
	Parent *Node
	Left   *Node
	Right  *Node
	leaf   bool
	dup    bool
	Hash   []byte
	C      Content
}

//verifyNode walks down the tree until hitting a leaf, calculating the hash at each level
//and returning the resulting hash of Node n.
func (n *Node) verifyNode() ([]byte, error) {
	if n.leaf {
		return n.C.CalculateHashBytes()
	}

	rightBytes, err := n.Right.verifyNode()
	if err != nil {
		return nil, err
	}

	leftBytes, err := n.Left.verifyNode()
	if err != nil {
		return nil, err
	}

	hash := solsha3.SoliditySHA3(
		solsha3.Bytes32(append(leftBytes, rightBytes...)),
	)

	return hash, nil
}

//calculateNodeHash is a helper function that calculates the hash of the node.
func (n *Node) calculateNodeHash() ([]byte, error) {
	if n.leaf {
		return n.C.CalculateHashBytes()
	}
	hash := solsha3.SoliditySHA3(
		solsha3.Bytes32(append(n.Left.Hash, n.Right.Hash...)),
	)
	return hash, nil
}

//NewTree creates a new Merkle Tree using the content cs.
func NewTree(cs []Content) (*MerkleTree, error) {
	root, leafs, err := BuildWithContent(cs)
	if err != nil {
		return nil, err
	}
	t := &MerkleTree{
		Root:       root,
		merkleRoot: root.Hash,
		Leafs:      leafs,
	}
	return t, nil
}

//BuildWithContent is a helper function that for a given set of Contents, generates a
//corresponding tree and returns the root node, a list of leaf nodes, and a possible error.
//Returns an error if cs contains no Contents.
func BuildWithContent(cs []Content) (*Node, []*Node, error) {
	if len(cs) == 0 {
		return nil, nil, errors.New("error: cannot construct tree with no content")
	}
	var leafs []*Node
	for _, c := range cs {
		hash, err := c.CalculateHashBytes()
		if err != nil {
			return nil, nil, err
		}

		leafs = append(leafs, &Node{
			Hash: hash,
			C:    c,
			leaf: true,
		})
	}
	if len(leafs)%2 == 1 {
		duplicate := &Node{
			Hash: leafs[len(leafs)-1].Hash,
			C:    leafs[len(leafs)-1].C,
			leaf: true,
			dup:  true,
		}
		leafs = append(leafs, duplicate)
	}
	root, err := buildIntermediate(leafs)
	if err != nil {
		return nil, nil, err
	}

	return root, leafs, nil
}

//buildIntermediate is a helper function that for a given list of leaf nodes, constructs
//the intermediate and root levels of the tree. Returns the resulting root node of the tree.
func buildIntermediate(nl []*Node) (*Node, error) {
	var nodes []*Node
	for i := 0; i < len(nl); i += 2 {
		var left, right int = i, i+1
		if i+1 == len(nl) {
			right = i
		}
		chash := append(nl[left].Hash, nl[right].Hash...)
		hh := solsha3.SoliditySHA3(
			solsha3.Bytes32(chash),
		)
		n := &Node{
			Left:  nl[left],
			Right: nl[right],
			Hash:  hh,
		}
		nodes = append(nodes, n)
		nl[left].Parent = n
		nl[right].Parent = n
		if len(nl) == 2 {
			return n, nil
		}
	}
	return buildIntermediate(nodes)
}

//MerkleRoot returns the unverified Merkle Root (hash of the root node) of the tree.
func (m *MerkleTree) MerkleRoot() []byte {
	return m.merkleRoot
}

//RebuildTree is a helper function that will rebuild the tree reusing only the content that
//it holds in the leaves.
func (m *MerkleTree) RebuildTree() error {
	var cs []Content
	for _, c := range m.Leafs {
		cs = append(cs, c.C)
	}
	root, leafs, err := BuildWithContent(cs)
	if err != nil {
		return err
	}
	m.Root = root
	m.Leafs = leafs
	m.merkleRoot = root.Hash
	return nil
}

//RebuildTreeWith replaces the content of the tree and does a complete rebuild; while the root of
//the tree will be replaced the MerkleTree completely survives this operation. Returns an error if the
//list of content cs contains no entries.
func (m *MerkleTree) RebuildTreeWith(cs []Content) error {
	root, leafs, err := BuildWithContent(cs)
	if err != nil {
		return err
	}
	m.Root = root
	m.Leafs = leafs
	m.merkleRoot = root.Hash
	return nil
}

//VerifyTree verify tree validates the hashes at each level of the tree and returns true if the
//resulting hash at the root of the tree matches the resulting root hash; returns false otherwise.
func (m *MerkleTree) VerifyTree() (bool, error) {
	calculatedMerkleRoot, err := m.Root.verifyNode()
	if err != nil {
		return false, err
	}

	if bytes.Compare(m.merkleRoot, calculatedMerkleRoot) == 0 {
		return true, nil
	}
	return false, nil
}

//VerifyContent indicates whether a given content is in the tree and the hashes are valid for that content.
//Returns true if the expected Merkle Root is equivalent to the Merkle root calculated on the critical path
//for a given content. Returns true if valid and false otherwise.
func (m *MerkleTree) VerifyContent(content Content) (bool, error) {
	for _, l := range m.Leafs {
		ok, err := l.C.Equals(content)
		if err != nil {
			return false, err
		}
		if ok {
			currentParent := l.Parent
			println(hex.EncodeToString(currentParent.Hash), "ONEEE")
			for currentParent != nil {
				rightBytes, err := currentParent.Right.calculateNodeHash()
				println(hex.EncodeToString(rightBytes), "TWOO")
				if err != nil {
					return false, err
				}
				leftBytes, err := currentParent.Left.calculateNodeHash()
				println(hex.EncodeToString(leftBytes), "THREEE")
				if err != nil {
					return false, err
				}
				if currentParent.Left.leaf && currentParent.Right.leaf {
					if bytes.Compare(solsha3.SoliditySHA3(solsha3.Bytes32(append(leftBytes, rightBytes...)), ), currentParent.Hash) != 0 {
						return false, nil
					}
					currentParent = currentParent.Parent
					println("FOURR")
				} else {
					if bytes.Compare(solsha3.SoliditySHA3(solsha3.Bytes32(append(leftBytes, rightBytes...)), ), currentParent.Hash) != 0 {
						return false, nil
					}
					currentParent = currentParent.Parent
					println("FIVEEEE")
				}
			}
			return true, nil
		}
	}
	return false, nil
}

//String returns a string representation of the tree. Only leaf nodes are included
//in the output.
func (m *MerkleTree) String() string {
	s := ""
	for _, l := range m.Leafs {
		s += fmt.Sprint(l)
		s += "\n"
	}
	return s
}

func (m *MerkleTree) GetHash() []string {
	var s []string
	for _, l := range m.Leafs {
		s = append(s, hex.EncodeToString(l.Hash))
	}
	return s
}

func ReturnTree(m *MerkleTree) ([]byte, []*Node) {
	return m.merkleRoot, m.Leafs
}

//func (n *Node) stringHash() string {
//	return hex.EncodeToString(n.Hash)
//}

func (m *MerkleTree) Strings() []string {
	var s []string
	for _, l := range m.Leafs {
		s = append(s, hex.EncodeToString(l.Hash))
	}
	return s
}
