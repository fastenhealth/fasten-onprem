package search

import (
	"context"
	"errors"
	"log"
	"os"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/typesense/typesense-go/typesense"
	"github.com/typesense/typesense-go/typesense/api"
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
	apiKey := os.Getenv("TYPESENSE_API_KEY")
	if apiKey == "" {
		log.Fatal("TYPESENSE_API_KEY not set")
	}

	Client = typesense.NewClient(
		typesense.WithServer("http://typesense:8108"),
		typesense.WithAPIKey(apiKey))

	log.Printf("Typesense client initialized with server: %s", "http://typesense:8108")

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
		_, err = Client.Collections().Create(context.Background(), &api.CollectionSchema{
			Name: "resources",
			Fields: []api.Field{
				{Name: "id", Type: "string"},
				{Name: "user_id", Type: "string"},
				{Name: "source_id", Type: "string"},
				{Name: "source_resource_type", Type: "string"},
				{Name: "source_resource_id", Type: "string"},
				{Name: "sort_date", Type: "float"},
				{Name: "sort_title", Type: "string", Optional: &optionalTrue},
				{Name: "source_uri", Type: "string", Optional: &optionalTrue},
			},
			DefaultSortingField: func(s string) *string { return &s }("sort_date"),
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
