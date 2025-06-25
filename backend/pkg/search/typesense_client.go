package search

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/google/uuid"
	"github.com/typesense/typesense-go/v3/typesense"
	"github.com/typesense/typesense-go/v3/typesense/api"
)

type SearchClient struct {
	Client *typesense.Client
}

func (s *SearchClient) IndexResource(resource *models.ResourceBase) error {

	print("Indexing resource in Typesense: ", resource)
	doc := map[string]interface{}{
		"id":                   uuid.New().String(), // Generate a new UUID for the document ID in order to avoid overlaps
		"sort_title":           derefStr(resource.SortTitle),
		"source_uri":           derefStr(resource.SourceUri),
		"user_id":              resource.UserID.String(),
		"source_id":            resource.SourceID.String(),
		"source_resource_type": resource.SourceResourceType,
		"source_resource_id":   resource.SourceResourceID,
		"sort_date":            float64(time.Now().Unix()),
		"resource_raw":         resource.ResourceRaw,
	}

	if resource.SortDate != nil {
		doc["sort_date"] = resource.SortDate.Unix()
	}

	if resource.SortTitle != nil {
		doc["sort_title"] = *resource.SortTitle
		doc["code_text"] = *resource.SortTitle // fallback
	}

	if resource.SourceUri != nil {
		doc["source_uri"] = *resource.SourceUri
	}
	// Extract `code.text` if present
	var rawMap map[string]interface{}
	if err := json.Unmarshal(resource.ResourceRaw, &rawMap); err == nil {
		if text, ok := extractCodeText(rawMap); ok {
			doc["code_text"] = text
		}
	}

	_, err := s.Client.Collection("resources").Documents().Upsert(context.Background(), doc, nil)
	if err != nil {
		return fmt.Errorf("failed to index resource: %w", err)
	}

	return nil
}

func (s *SearchClient) SearchResources(query string, resourceTypeFilter *string, page int, perPage int) ([]map[string]interface{}, int, error) {
	searchParams := &api.SearchCollectionParams{
		Q:       ptr(query),
		QueryBy: ptr("sort_title,code_text,source_resource_type,source_resource_id,source_uri"),
		SortBy:  ptr("sort_date:desc"),
		Page:    intPtr(page),
		PerPage: intPtr(perPage),
	}

	if resourceTypeFilter != nil {
		filter := fmt.Sprintf("source_resource_type:=%s", *resourceTypeFilter)
		searchParams.FilterBy = &filter
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

func derefStr(s *string) string {
	if s != nil {
		return *s
	}
	return ""
}

func extractCodeText(raw map[string]interface{}) (string, bool) {
	if code, ok := raw["code"].(map[string]interface{}); ok {
		if text, ok := code["text"].(string); ok {
			return text, true
		}
	}
	return "", false
}

// ptr returns a pointer to the given string.
func ptr(s string) *string {
	return &s
}

// intPtr returns a pointer to the given int.
func intPtr(i int) *int {
	return &i
}
