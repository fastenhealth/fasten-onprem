package models

type ResponseWrapper struct {
	Success bool        `json:"success"`
	Error   string      `json:"error"`
	Data    interface{} `json:"data"`
}

type ResponseWrapperTyped[T any] struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Data    T      `json:"data"`
}
