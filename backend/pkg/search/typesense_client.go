package search

import (
	"context"
	"fmt"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/google/uuid"
	"github.com/typesense/typesense-go/typesense"
	"github.com/typesense/typesense-go/typesense/api"
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
	}

	if resource.SourceUri != nil {
		doc["source_uri"] = *resource.SourceUri
	}

	_, err := s.Client.Collection("resources").Documents().Upsert(context.Background(), doc)
	if err != nil {
		return fmt.Errorf("failed to index resource: %w", err)
	}

	return nil
}

func (s *SearchClient) SearchResources(query string) ([]map[string]interface{}, error) {
	searchParams := &api.SearchCollectionParams{
		Q:       query,
		QueryBy: "sort_title,source_resource_type,source_resource_id,source_uri",
		// Add other search params as needed (e.g., filters, pagination)
	}

	resp, err := s.Client.Collection("resources").Documents().Search(context.Background(), searchParams)
	if err != nil {
		return nil, err
	}

	// resp.Hits contains the documents matched
	results := make([]map[string]interface{}, 0, len(*resp.Hits))
	for _, hit := range *resp.Hits {
		if hit.Document != nil {
			results = append(results, *hit.Document)
		}
	}

	return results, nil
}

func derefStr(s *string) string {
	if s != nil {
		return *s
	}
	return ""
}
