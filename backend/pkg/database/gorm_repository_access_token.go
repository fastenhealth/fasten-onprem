package database

import (
	"context"
	"fmt"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Access Token Management

func (gr *GormRepository) CreateAccessToken(ctx context.Context, accessToken *models.AccessToken) error {
	if accessToken.TokenHash == "" {
		return fmt.Errorf("token hash cannot be empty")
	}

	if accessToken.IssuedAt.IsZero() {
		accessToken.IssuedAt = time.Now()
	}

	// Create the access token
	if err := gr.GormClient.WithContext(ctx).Create(accessToken).Error; err != nil {
		return fmt.Errorf("failed to create access token: %w", err)
	}

	return nil;
}

func (gr *GormRepository) GetAccessToken(ctx context.Context, tokenID string) (*models.AccessToken, error) {
	var accessToken models.AccessToken
	result := gr.GormClient.WithContext(ctx).
		Where("token_id = ?", tokenID).
		First(&accessToken)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get access token: %w", result.Error)
	}

	return &accessToken, nil
}

func (gr *GormRepository) GetUserAccessTokens(ctx context.Context, userID uuid.UUID) ([]models.AccessToken, error) {
	var tokens []models.AccessToken
	result := gr.GormClient.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("issued_at DESC").
		Find(&tokens)

	if result.Error != nil {
		return nil, fmt.Errorf("failed to get user access tokens: %w", result.Error)
	}

	return tokens, nil
}

func (gr *GormRepository) DeleteAccessToken(ctx context.Context, tokenID string) error {
	result := gr.GormClient.WithContext(ctx).
		Where("token_id = ?", tokenID).
		Delete(&models.AccessToken{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete access token: %w", result.Error)
	}

	return nil
}