package database

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// HashToken creates a secure hash of a token for storage
func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

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

	// Create initial history entry
	history := &models.AccessTokenHistory{
		TokenID:   accessToken.TokenID,
		UserID:    accessToken.UserID,
		EventType: "created",
		EventTime: accessToken.IssuedAt,
	}

	return gr.CreateAccessTokenHistory(ctx, history)
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

func (gr *GormRepository) GetAccessTokenByHash(ctx context.Context, tokenHash string) (*models.AccessToken, error) {
	var accessToken models.AccessToken
	result := gr.GormClient.WithContext(ctx).
		Where("token_hash = ?", tokenHash).
		First(&accessToken)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get access token by hash: %w", result.Error)
	}

	// Check if token is expired
	if accessToken.IsExpired() {
		return nil, fmt.Errorf("access token is expired")
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

func (gr *GormRepository) UpdateAccessToken(ctx context.Context, accessToken *models.AccessToken) error {
	result := gr.GormClient.WithContext(ctx).Save(accessToken)
	if result.Error != nil {
		return fmt.Errorf("failed to update access token: %w", result.Error)
	}

	return nil
}

func (gr *GormRepository) RevokeAccessToken(ctx context.Context, tokenID string, revokedBy string) error {
	// First get the token to check if it exists
	token, err := gr.GetAccessToken(ctx, tokenID)
	if err != nil {
		return fmt.Errorf("failed to get access token: %w", err)
	}

	if token == nil {
		return fmt.Errorf("access token not found")
	}

	// Update the token status
	result := gr.GormClient.WithContext(ctx).
		Model(&models.AccessToken{}).
		Where("token_id = ?", tokenID).
		Updates(map[string]interface{}{
			"is_revoked":  true,
			"is_active":   false,
			"revoked_at":  time.Now(),
			"revoked_by":  revokedBy,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to revoke access token: %w", result.Error)
	}

	// Create history entry for revocation
	history := &models.AccessTokenHistory{
		TokenID:   tokenID,
		UserID:    token.UserID,
		EventType: "revoked",
		EventTime: time.Now(),
		Metadata:  fmt.Sprintf("revoked_by:%s", revokedBy),
	}

	return gr.CreateAccessTokenHistory(ctx, history)
}

func (gr *GormRepository) RevokeAllAccessTokens(ctx context.Context, userID uuid.UUID, revokedBy string) error {
	// Get all active tokens for the user
	tokens, err := gr.GetUserAccessTokens(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user access tokens: %w", err)
	}

	// Revoke each token individually to create history entries
	for _, token := range tokens {
		if !token.IsRevoked {
			if err := gr.RevokeAccessToken(ctx, token.TokenID, revokedBy); err != nil {
				// Log error but continue with other tokens
				fmt.Printf("Failed to revoke access token %s: %v", token.TokenID, err)
			}
		}
	}

	return nil
}

func (gr *GormRepository) CleanupExpiredAccessTokens(ctx context.Context) (int64, error) {
	result := gr.GormClient.WithContext(ctx).
		Model(&models.AccessToken{}).
		Where("expires_at < ?", time.Now()).
		Update("is_active", false)

	if result.Error != nil {
		return 0, fmt.Errorf("failed to cleanup expired access tokens: %w", result.Error)
	}

	return result.RowsAffected, nil
}

// Access Token History

func (gr *GormRepository) CreateAccessTokenHistory(ctx context.Context, history *models.AccessTokenHistory) error {
	if history.EventTime.IsZero() {
		history.EventTime = time.Now()
	}

	if err := gr.GormClient.WithContext(ctx).Create(history).Error; err != nil {
		return fmt.Errorf("failed to create access token history: %w", err)
	}

	return nil
}

func (gr *GormRepository) GetAccessTokenHistory(ctx context.Context, tokenID string, limit int) ([]models.AccessTokenHistory, error) {
	var history []models.AccessTokenHistory
	result := gr.GormClient.WithContext(ctx).
		Where("token_id = ?", tokenID).
		Order("event_time DESC").
		Limit(limit).
		Find(&history)

	if result.Error != nil {
		return nil, fmt.Errorf("failed to get access token history: %w", result.Error)
	}

	return history, nil
}



// Access Connections

func (gr *GormRepository) CreateAccessConnection(ctx context.Context, connection *models.AccessConnection) error {
	if connection.ConnectedAt.IsZero() {
		connection.ConnectedAt = time.Now()
	}

	if connection.LastSeen.IsZero() {
		connection.LastSeen = time.Now()
	}

	if err := gr.GormClient.WithContext(ctx).Create(connection).Error; err != nil {
		return fmt.Errorf("failed to create access connection: %w", err)
	}

	return nil
}

func (gr *GormRepository) GetUserAccessConnections(ctx context.Context, userID uuid.UUID) ([]models.AccessConnection, error) {
	var connections []models.AccessConnection
	result := gr.GormClient.WithContext(ctx).
		Joins("JOIN access_tokens ON access_connections.token_id = access_tokens.token_id").
		Where("access_tokens.user_id = ? AND access_connections.is_connected = ?", userID, true).
		Order("access_connections.last_seen DESC").
		Find(&connections)

	if result.Error != nil {
		return nil, fmt.Errorf("failed to get user access connections: %w", result.Error)
	}

	return connections, nil
}

func (gr *GormRepository) UpdateAccessConnection(ctx context.Context, connection *models.AccessConnection) error {
	connection.LastSeen = time.Now()
	result := gr.GormClient.WithContext(ctx).Save(connection)
	if result.Error != nil {
		return fmt.Errorf("failed to update access connection: %w", result.Error)
	}

	return nil
}

func (gr *GormRepository) DisconnectAccessConnection(ctx context.Context, tokenID string) error {
	now := time.Now()
	result := gr.GormClient.WithContext(ctx).
		Model(&models.AccessConnection{}).
		Where("token_id = ?", tokenID).
		Updates(map[string]interface{}{
			"is_connected":      false,
			"disconnected_at":   &now,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to disconnect access connection: %w", result.Error)
	}

	return nil
}

// Device Access History

func (gr *GormRepository) CreateDeviceAccessHistory(ctx context.Context, history *models.DeviceAccessHistory) error {
	if history.EventTime.IsZero() {
		history.EventTime = time.Now()
	}

	if err := gr.GormClient.WithContext(ctx).Create(history).Error; err != nil {
		return fmt.Errorf("failed to create device access history: %w", err)
	}

	return nil
}



// Utility functions

func (gr *GormRepository) DeleteAccessToken(ctx context.Context, tokenID string) error {
	result := gr.GormClient.WithContext(ctx).
		Where("token_id = ?", tokenID).
		Delete(&models.AccessToken{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete access token: %w", result.Error)
	}

	return nil
}

func (gr *GormRepository) DeleteAllAccessTokens(ctx context.Context, userID uuid.UUID) (int64, error) {
	result := gr.GormClient.WithContext(ctx).
		Where("user_id = ?", userID).
		Delete(&models.AccessToken{})

	if result.Error != nil {
		return 0, fmt.Errorf("failed to delete all access tokens: %w", result.Error)
	}

	return result.RowsAffected, nil
}

func (gr *GormRepository) UpdateTokenUsage(ctx context.Context, userID uuid.UUID, tokenID string) error {
	// Update last used timestamp and increment use count
	result := gr.GormClient.WithContext(ctx).
		Model(&models.AccessToken{}).
		Where("token_id = ? AND user_id = ?", tokenID, userID).
		Updates(map[string]interface{}{
			"last_used_at": time.Now(),
		})

	if result.Error != nil {
		return fmt.Errorf("failed to update token usage: %w", result.Error)
	}

	// Increment use count
	result = gr.GormClient.WithContext(ctx).
		Model(&models.AccessToken{}).
		Where("token_id = ? AND user_id = ?", tokenID, userID).
		UpdateColumn("use_count", gorm.Expr("use_count + ?", 1))

	if result.Error != nil {
		return fmt.Errorf("failed to increment token use count: %w", result.Error)
	}

	return nil
}
