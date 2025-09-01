package database

import (
	"context"
	"fmt"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
)

// Access Token Management

func (gr *GormRepository) CreateAccessToken(ctx context.Context, accessToken *models.AccessToken) error {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}

	accessToken.UserID = currentUser.ID

	return gr.GormClient.WithContext(ctx).Create(accessToken).Error
}

func (gr *GormRepository) GetAccessToken(ctx context.Context, tokenID string) (*models.AccessToken, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	var accessToken models.AccessToken
	result := gr.GormClient.WithContext(ctx).
		Where(models.AccessToken{UserID: currentUser.ID, TokenID: tokenID}).
		First(&accessToken)

	if result.Error != nil {
		return nil, fmt.Errorf("failed to get access token: %w", result.Error)
	}

	return &accessToken, nil
}

func (gr *GormRepository) GetAccessTokenByTokenIDAndUsername(ctx context.Context, tokenID string, username string) (*models.AccessToken, error) {
	user, err := gr.GetUserByUsername(ctx, username)
    if err != nil {
        return nil, fmt.Errorf("failed to get user for access token validation: %w", err)
    }

    var accessToken models.AccessToken
	result := gr.GormClient.WithContext(ctx).
		Where(models.AccessToken{UserID: user.ID, TokenID: tokenID}).
		First(&accessToken)

    if result.Error != nil {
        return nil, fmt.Errorf("failed to get access token: %w", result.Error)
    }

    return &accessToken, nil
}

func (gr *GormRepository) GetUserAccessTokens(ctx context.Context) ([]models.AccessToken, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	var tokens []models.AccessToken
	result := gr.GormClient.WithContext(ctx).
		Where(models.AccessToken{UserID: currentUser.ID}).
		Order("issued_at DESC").
		Find(&tokens)

	if result.Error != nil {
		return nil, fmt.Errorf("failed to get user access tokens: %w", result.Error)
	}

	return tokens, nil
}

func (gr *GormRepository) DeleteAccessToken(ctx context.Context, tokenID string) error {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}

	token, err := gr.GetAccessToken(ctx, tokenID)
	if err != nil || token.UserID != currentUser.ID {
		return fmt.Errorf("token is not accessible")
	}

	result := gr.GormClient.WithContext(ctx).
		Where(models.AccessToken{TokenID: tokenID}).
		Delete(&models.AccessToken{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete access token: %w", result.Error)
	}

	return nil
}
