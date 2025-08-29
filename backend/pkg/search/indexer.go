package search

import (
	"context"
	"fmt"
	"strings"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/typesense/typesense-go/v3/typesense"
	"github.com/typesense/typesense-go/v3/typesense/api"
)

type IndexerService struct {
	Client *typesense.Client
}

func (s *IndexerService) IndexResource(resource *models.ResourceBase) error {
	// Create a composite ID formed with
	compositeID := fmt.Sprintf("%s-%s-%s", resource.SourceID.String(), resource.SourceResourceType, resource.SourceResourceID)

	print("Indexing resource in Typesense: ", resource)
	doc := map[string]interface{}{
		"id":                   compositeID,
		"sort_title":           derefStr(resource.SortTitle),
		"source_uri":           derefStr(resource.SourceUri),
		"user_id":              resource.UserID.String(),
		"source_id":            resource.SourceID.String(),
		"source_resource_type": resource.SourceResourceType,
		"source_resource_id":   resource.SourceResourceID,
		"sort_date":            0, // Default to 0 if SortDate is nil
		"resource_raw":         resource.ResourceRaw,
	}

	if resource.SortDate != nil {
		doc["sort_date"] = resource.SortDate.UnixMilli() // Convert to milliseconds since epoch
	}

	_, err := s.Client.Collection("resources").Documents().Upsert(context.Background(), doc, &api.DocumentIndexParameters{})
	if err != nil {
		return fmt.Errorf("failed to index resource: %w", err)
	}
	print("Resource indexed successfully in Typesense")

	return nil
}

func (s *IndexerService) SearchResources(query string, resourceTypeFilter *string, userID *string, page int, perPage int) ([]map[string]interface{}, int, error) {
	searchParams := &api.SearchCollectionParams{
		Q:       ptr(query),
		QueryBy: ptr("sort_title,source_resource_type,source_resource_id,source_uri"),
		SortBy:  ptr("sort_date:desc"),
		Page:    intPtr(page),
		PerPage: intPtr(perPage),
	}

	filters := []string{}

	if resourceTypeFilter != nil {
		filters = append(filters, fmt.Sprintf("source_resource_type:=%s", *resourceTypeFilter))
	}
	if userID != nil {
		filters = append(filters, fmt.Sprintf("user_id:=%s", *userID))
	}
	if len(filters) > 0 {
		filterStr := strings.Join(filters, " && ")
		searchParams.FilterBy = &filterStr
	}

	resp, err := s.Client.Collection("resources").Documents().Search(context.Background(), searchParams)
	if err != nil {
		return nil, 0, err
	}

	results := make([]map[string]interface{}, 0, len(*resp.Hits))
	for _, hit := range *resp.Hits {
		if hit.Document != nil {
			results = append(results, *hit.Document)
		}
	}

	// Extract total number of matches
	total := 0
	if resp.Found != nil {
		total = *resp.Found
	}

	return results, total, nil
}

func (s *IndexerService) GetResourceByID(id string) (map[string]interface{}, error) {
	doc, err := s.Client.Collection("resources").Document(id).Retrieve(context.Background())
	if err != nil {
		return nil, err
	}

	return doc, nil
}

func derefStr(s *string) string {
	if s != nil {
		return *s
	}
	return ""
}

func ptr(s string) *string {
	return &s
}

func intPtr(i int) *int {
	return &i
}
