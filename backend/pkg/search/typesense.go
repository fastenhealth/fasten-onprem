package search

import (
	"context"
	"errors"
	"log"
	"net/http" // Added for http.StatusNotFound
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
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

func initClient(cfg config.Interface) error {
	apiUri := cfg.GetString("typesense.uri")
	apiKey := cfg.GetString("typesense.api_key")

	Client = typesense.NewClient(
		typesense.WithServer(apiUri),
		typesense.WithAPIKey(apiKey),
		typesense.WithConnectionTimeout(15 * time.Minute))

	log.Printf("Typesense client initialized with server: %s", apiUri)

	err := waitForTypesense(Client, 10, 2*time.Second)
	if err != nil {
		return errors.New("failed to initialize Typesense: " + err.Error())
	}
	return nil
}

func ensureCollection(ctx context.Context, client *typesense.Client, logger *logrus.Entry, schema *api.CollectionSchema) error {
	_, err := client.Collection(schema.Name).Retrieve(ctx)
	if err == nil {
		logger.Infof("📦 Typesense collection '%s' already exists", schema.Name)
		return nil
	}

	logger.Infof("📦 Creating '%s' collection…", schema.Name)
	_, err = client.Collections().Create(ctx, schema)
	if err != nil {
		logger.WithError(err).Errorf("❌ Failed to create '%s' collection in Typesense", schema.Name)
		return err
	}
	logger.Infof("✅ Created '%s' collection", schema.Name)
	return nil
}

func ensureConversationModel(ctx context.Context, client *typesense.Client, cfg config.Interface, logger *logrus.Entry) error {
	modelId := cfg.GetString("typesense.conversation_model.id")
	_, err := client.Conversations().Model(modelId).Retrieve(ctx)
	if err == nil {
		logger.Info("📦 Typesense conversation model already exists")
		return nil
	}

	var httpErr *typesense.HTTPError
	if errors.As(err, &httpErr) && httpErr.Status == http.StatusNotFound {
		logger.Info("📦 Creating Typesense conversation model ...")

		systemPrompt := "You are an assistant for question-answering. You can only make conversations based on the provided context. If a response cannot be formed strictly using the provided context, politely say you do not have knowledge about that topic."
		modelName := cfg.GetString("typesense.conversation_model.name")
		vllmUrl := cfg.GetString("typesense.conversation_model.vllm_url")
		historyCollection := cfg.GetString("typesense.conversation_model.history_collection")

		_, err = client.Conversations().Models().Create(ctx, &api.ConversationModelCreateSchema{
			Id:                &modelId,
			ModelName:         modelName,
			VllmUrl:           &vllmUrl,
			HistoryCollection: historyCollection,
			SystemPrompt:      &systemPrompt,
			MaxBytes:          131072,
		})
		if err != nil {
			logger.WithError(err).Error("❌ Failed to create conversation model in Typesense")
			return err
		}
		logger.Info("✅ Created conversation model")
		return nil
	} else {
		logger.WithError(err).Error("❌ Failed to retrieve conversation model from Typesense")
		return err
	}
}

func Init(cfg config.Interface, logger *logrus.Entry) error {
	if err := initClient(cfg); err != nil {
		log.Fatalf("ERROR: %v", err)
	}

	ctx := context.Background()
	optionalTrue := true
	optionalFalse := false

	// Resources Collection Schema
	resourcesSchema := &api.CollectionSchema{
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
					From        []string `json:"from"`
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
						ModelName: "ts/all-MiniLM-L12-v2",
					},
				},
			},
		},
		DefaultSortingField: func(s string) *string { return &s }("sort_date"),
		EnableNestedFields:  &optionalTrue,
	}

	if err := ensureCollection(ctx, Client, logger, resourcesSchema); err != nil {
		return err
	}

	// Conversation Store Collection Schema
	conversationStoreSchema := &api.CollectionSchema{
		Name: "conversation_store",
		Fields: []api.Field{
			{Name: "conversation_id", Type: "string", Facet: &optionalTrue},
			{Name: "model_id", Type: "string"},
			{Name: "timestamp", Type: "int32"},
			{Name: "role", Type: "string", Index: &optionalFalse},
			{Name: "message", Type: "string", Index: &optionalFalse},
		},
	}

	if err := ensureCollection(ctx, Client, logger, conversationStoreSchema); err != nil {
		return err
	}

	if err := ensureConversationModel(ctx, Client, cfg, logger); err != nil {
		return err
	}

	logger.Info("✅ Typesense client initialized and collections ready")
	return nil
}
