package models

type QueryResourceAggregationType string

const (
	QueryResourceAggregationTypeCountBy QueryResourceAggregationType = "countBy"
	QueryResourceAggregationTypeGroupBy QueryResourceAggregationType = "groupBy"
	QueryResourceAggregationTypeMinBy   QueryResourceAggregationType = "minBy"
	QueryResourceAggregationTypeMaxBy   QueryResourceAggregationType = "maxBy"
)

// maps to frontend/src/app/models/widget/dashboard-widget-query.ts
type QueryResource struct {
	Use    string                 `json:"use"`
	Select []string               `json:"select"`
	From   string                 `json:"from"`
	Where  map[string]interface{} `json:"where"`

	//aggregation fields
	AggregationParams []string                      `json:"aggregation_params"`
	AggregationType   *QueryResourceAggregationType `json:"aggregation_type"`
}
