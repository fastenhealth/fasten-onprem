package models

type UserSettings struct {
	DashboardLocations []string `json:"dashboard_locations" mapstructure:"dashboard_locations"`
}
