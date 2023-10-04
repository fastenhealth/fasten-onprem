package models

type ResourceGraphMetadata struct {
	TotalElements int `json:"total_elements"`
	PageSize      int `json:"page_size"`
	Page          int `json:"page"`
}
