package search

import (
	"context"
	"errors"
	"log"
	"os"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/typesense/typesense-go/v3/typesense"
	"github.com/typesense/typesense-go/v3/typesense/api"
)

var Client *typesense.Client

func waitForTypesense(client *typesense.Client, maxRetries int, delay time.Duration) error {
	for i := 0; i < maxRetries; i++ {
		_, err := client.Collections().Retrieve(context.Background()) // simple ping to check if Typesense is ready
		if err == nil {
			return nil // Typesense is ready
		}
		log.Printf("Typesense not ready yet (attempt %d/%d): %v", i+1, maxRetries, err)
		time.Sleep(delay)
	}
	return errors.New("typesense did not become ready in time")
}

func Init(logger *logrus.Entry) error {
	apiUri := os.Getenv("TYPESENSE_URI")
	if apiUri == "" {
		log.Fatal("TYPESENSE_URI not set")
	}

	apiKey := os.Getenv("TYPESENSE_API_KEY")
	if apiKey == "" {
		log.Fatal("TYPESENSE_API_KEY not set")
	}

	Client = typesense.NewClient(
		typesense.WithServer(apiUri),
		typesense.WithAPIKey(apiKey))

	log.Printf("Typesense client initialized with server: %s", apiUri)

	err := waitForTypesense(Client, 10, 2*time.Second)
	if err != nil {
		log.Fatalf("ERROR: failed to initialize Typesense: %v", err)
	}

	// Check if "resources" collection exists
	_, err = Client.Collection("resources").Retrieve(context.Background())
	if err == nil {
		logger.Info("📦 Typesense collection 'resources' already exists")
	} else {
		logger.Info("📦 Creating Typesense collection 'resources'...")

		optionalTrue := true
		// Create the "resources" collection with the specified schema
		_, err = Client.Collections().Create(context.Background(), &api.CollectionSchema{
			Name: "resources",
			Fields: []api.Field{
				{Name: "id", Type: "string"},
				{Name: "user_id", Type: "string"},
				{Name: "source_id", Type: "string"},
				{Name: "source_resource_type", Type: "string"},
				{Name: "source_resource_id", Type: "string"},
				{Name: "sort_date", Type: "int64"},
				{Name: "sort_title", Type: "string", Optional: &optionalTrue},
				{Name: "source_uri", Type: "string", Optional: &optionalTrue},
				{Name: "resource_raw", Type: "object", Optional: &optionalTrue}, // JSON blob
				{
					Name: "embedding",
					Type: "float[]",
					Embed: &struct {
						From  []string `json:"from"`
						ModelConfig struct {
							AccessToken    *string `json:"access_token,omitempty"`
							ApiKey         *string `json:"api_key,omitempty"`
							ClientId       *string `json:"client_id,omitempty"`
							ClientSecret   *string `json:"client_secret,omitempty"`
							IndexingPrefix *string `json:"indexing_prefix,omitempty"`
							ModelName      string  `json:"model_name"`
							ProjectId      *string `json:"project_id,omitempty"`
							QueryPrefix    *string `json:"query_prefix,omitempty"`
							RefreshToken   *string `json:"refresh_token,omitempty"`
							Url            *string `json:"url,omitempty"`
						} `json:"model_config"`
					}{
						From: []string{`source_resource_type`, `sort_title`},
						ModelConfig: struct {
							AccessToken    *string `json:"access_token,omitempty"`
							ApiKey         *string `json:"api_key,omitempty"`
							ClientId       *string `json:"client_id,omitempty"`
							ClientSecret   *string `json:"client_secret,omitempty"`
							IndexingPrefix *string `json:"indexing_prefix,omitempty"`
							ModelName      string  `json:"model_name"`
							ProjectId      *string `json:"project_id,omitempty"`
							QueryPrefix    *string `json:"query_prefix,omitempty"`
							RefreshToken   *string `json:"refresh_token,omitempty"`
							Url            *string `json:"url,omitempty"`
						}{
							// ModelName:    "ts/snowflake-arctic-embed-m",
							ModelName:    "ts/all-MiniLM-L12-v2",
						},
					},
				},
			},
			DefaultSortingField: func(s string) *string { return &s }("sort_date"),
			EnableNestedFields:  &optionalTrue,
		})
		if err != nil {
			logger.WithError(err).Error("❌ Failed to create 'resources' collection in Typesense")
			return err
		}
		logger.Info("✅ Created 'resources' collection")
	}

	logger.Info("✅ Typesense client initialized and collection ready")
	return nil
}
