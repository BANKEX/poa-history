// GENERATED BY THE COMMAND ABOVE; DO NOT EDIT
// This file was generated by swaggo/swag at
// 2018-09-14 13:34:36.670016119 +0300 MSK m=+0.027139740

package docs

import (
	"github.com/swaggo/swag"
)

var doc = `{
    "swagger": "2.0",
    "info": {
        "description": "This is POA History swagger documentation",
        "title": "Swagger History API",
        "contact": {
            "name": "API Support",
            "email": "nk@bankexfoundation.org"
        },
        "license": {
            "name": "MIT",
            "url": "https://opensource.org/licenses/MIT"
        },
        "version": "1.0"
    },
    "host": "history.bankex.team",
    "basePath": "/v2",
    "paths": {
        "/a/new/{assetId}/{hash}": {
            "post": {
                "description": "add hash by assetId",
                "consumes": [
                    "text/plain"
                ],
                "produces": [
                    "application/json"
                ],
                "summary": "Add a new asset to assetId",
                "parameters": [
                    {
                        "type": "string",
                        "description": "assetId",
                        "name": "assetId",
                        "in": "path",
                        "required": true
                    },
                    {
                        "type": "string",
                        "description": "Hash of file",
                        "name": "hash",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/responses.CreateResponse"
                            }
                        }
                    }
                }
            }
        }
    },
    "definitions": {
        "responses.CreateResponse": {
            "type": "object",
            "properties": {
                "assetId": {
                    "type": "string",
                    "example": "a"
                },
                "hash": {
                    "type": "string",
                    "example": "96e75810b7fe519dd92f6a3f72170b00c0a8a9553f9c765a3cc681eaf7eeab38"
                },
                "merkleRoot": {
                    "type": "array",
                    "items": {
                        "type": "byte"
                    },
                    "example": [
                        "Vu14mZ91jlhkqHhjFwmgjXgxyhLjLADVQlqMSQA3Q3o="
                    ]
                },
                "timestamp": {
                    "type": "integer",
                    "example": 1536920750859
                },
                "txNumber": {
                    "type": "integer",
                    "example": 0
                }
            }
        }
    }
}`

type s struct{}

func (s *s) ReadDoc() string {
	return doc
}
func init() {
	swag.Register(swag.Name, &s{})
}
