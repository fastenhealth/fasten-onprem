package models

// maps to frontend/src/app/models/widget/dashboard-widget-query.ts
type QueryResource struct {
	Use    string                 `json:"use"`
	Select []string               `json:"select"`
	From   string                 `json:"from"`
	Where  map[string]interface{} `json:"where"`
}
