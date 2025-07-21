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

// Sync Token Management

func (gr *GormRepository) CreateSyncToken(ctx context.Context, syncToken *models.SyncToken) error {
	if syncToken.TokenHash == "" {
		return fmt.Errorf("token hash is required")
	}
	
	// Set default values
	if syncToken.IssuedAt.IsZero() {
		syncToken.IssuedAt = time.Now()
	}
	
	// Create the token record
	if err := gr.GormClient.WithContext(ctx).Create(syncToken).Error; err != nil {
		return fmt.Errorf("failed to create sync token: %w", err)
	}
	
	// Create history entry
	history := &models.SyncTokenHistory{
		TokenID:   syncToken.TokenID,
		UserID:    syncToken.UserID,
		EventType: "created",
		EventTime: syncToken.IssuedAt,
		UserAgent: syncToken.UserAgent,
		Success:   true,
	}
	
	return gr.CreateSyncTokenHistory(ctx, history)
}

func (gr *GormRepository) GetSyncToken(ctx context.Context, tokenID string) (*models.SyncToken, error) {
	var syncToken models.SyncToken
	
	result := gr.GormClient.WithContext(ctx).
		Preload("User").
		Where("token_id = ?", tokenID).
		First(&syncToken)
	
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get sync token: %w", result.Error)
	}
	
	return &syncToken, nil
}

func (gr *GormRepository) GetSyncTokenByHash(ctx context.Context, tokenHash string) (*models.SyncToken, error) {
	var syncToken models.SyncToken
	
	result := gr.GormClient.WithContext(ctx).
		Preload("User").
		Where("token_hash = ? AND is_active = ? AND is_revoked = ?", tokenHash, true, false).
		First(&syncToken)
	
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get sync token by hash: %w", result.Error)
	}
	
	// Check if token is expired
	if syncToken.IsExpired() {
		return nil, fmt.Errorf("token is expired")
	}
	
	return &syncToken, nil
}

func (gr *GormRepository) GetUserSyncTokens(ctx context.Context, userID uuid.UUID) ([]models.SyncToken, error) {
	var tokens []models.SyncToken
	result := gr.GormClient.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&tokens)
	if result.Error != nil {
		return nil, result.Error
	}
	return tokens, nil
}

func (gr *GormRepository) UpdateSyncToken(ctx context.Context, syncToken *models.SyncToken) error {
	result := gr.GormClient.WithContext(ctx).Save(syncToken)
	
	if result.Error != nil {
		return fmt.Errorf("failed to update sync token: %w", result.Error)
	}
	
	return nil
}

func (gr *GormRepository) RevokeSyncToken(ctx context.Context, tokenID string, revokedBy string) error {
	now := time.Now()
	
	// Update the token
	result := gr.GormClient.WithContext(ctx).
		Model(&models.SyncToken{}).
		Where("token_id = ?", tokenID).
		Updates(map[string]interface{}{
			"is_revoked":  true,
			"is_active":   false,
			"revoked_at":  now,
			"revoked_by":  revokedBy,
			"updated_at":  now,
		})
	
	if result.Error != nil {
		return fmt.Errorf("failed to revoke sync token: %w", result.Error)
	}
	
	if result.RowsAffected == 0 {
		return fmt.Errorf("sync token not found")
	}
	
	// Create history entry
	history := &models.SyncTokenHistory{
		TokenID:   tokenID,
		EventType: "revoked",
		EventTime: now,
		UserAgent: revokedBy,
		Success:   true,
		Metadata:  fmt.Sprintf(`{"revoked_by": "%s"}`, revokedBy),
	}
	
	return gr.CreateSyncTokenHistory(ctx, history)
}

func (gr *GormRepository) RevokeAllSyncTokens(ctx context.Context, userID uuid.UUID, revokedBy string) error {
	now := time.Now()
	result := gr.GormClient.WithContext(ctx).
		Model(&models.SyncToken{}).
		Where("user_id = ? AND is_active = ? AND is_revoked = ?", userID, true, false).
		Updates(map[string]interface{}{
			"is_active":   false,
			"is_revoked":  true,
			"revoked_at":  now,
			"revoked_by":  revokedBy,
			"updated_at":  now,
		})
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (gr *GormRepository) CleanupExpiredSyncTokens(ctx context.Context) (int64, error) {
	now := time.Now()
	
	// Update expired tokens
	result := gr.GormClient.WithContext(ctx).
		Model(&models.SyncToken{}).
		Where("expires_at <= ? AND is_active = ?", now, true).
		Updates(map[string]interface{}{
			"is_active":  false,
			"updated_at": now,
		})
	
	if result.Error != nil {
		return 0, fmt.Errorf("failed to cleanup expired sync tokens: %w", result.Error)
	}
	
	return result.RowsAffected, nil
}

// Sync Token History

func (gr *GormRepository) CreateSyncTokenHistory(ctx context.Context, history *models.SyncTokenHistory) error {
	if history.EventTime.IsZero() {
		history.EventTime = time.Now()
	}
	
	result := gr.GormClient.WithContext(ctx).Create(history)
	
	if result.Error != nil {
		return fmt.Errorf("failed to create sync token history: %w", result.Error)
	}
	
	return nil
}

func (gr *GormRepository) GetSyncTokenHistory(ctx context.Context, tokenID string, limit int) ([]models.SyncTokenHistory, error) {
	var history []models.SyncTokenHistory
	
	query := gr.GormClient.WithContext(ctx).
		Where("token_id = ?", tokenID).
		Order("event_time DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	result := query.Find(&history)
	
	if result.Error != nil {
		return nil, fmt.Errorf("failed to get sync token history: %w", result.Error)
	}
	
	return history, nil
}

func (gr *GormRepository) GetUserSyncHistory(ctx context.Context, userID uuid.UUID, limit int) ([]models.SyncTokenHistory, error) {
	var history []models.SyncTokenHistory
	
	query := gr.GormClient.WithContext(ctx).
		Joins("JOIN sync_tokens ON sync_token_histories.token_id = sync_tokens.token_id").
		Where("sync_tokens.user_id = ?", userID).
		Order("sync_token_histories.event_time DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	result := query.Find(&history)
	
	if result.Error != nil {
		return nil, fmt.Errorf("failed to get user sync history: %w", result.Error)
	}
	
	return history, nil
}

// Sync Connection Management

func (gr *GormRepository) CreateSyncConnection(ctx context.Context, connection *models.SyncConnection) error {
	if connection.ConnectedAt.IsZero() {
		connection.ConnectedAt = time.Now()
	}
	connection.LastSeen = connection.ConnectedAt
	
	result := gr.GormClient.WithContext(ctx).Create(connection)
	
	if result.Error != nil {
		return fmt.Errorf("failed to create sync connection: %w", result.Error)
	}
	
	return nil
}

func (gr *GormRepository) UpdateSyncConnection(ctx context.Context, connection *models.SyncConnection) error {
	connection.LastSeen = time.Now()
	
	result := gr.GormClient.WithContext(ctx).Save(connection)
	
	if result.Error != nil {
		return fmt.Errorf("failed to update sync connection: %w", result.Error)
	}
	
	return nil
}

func (gr *GormRepository) GetActiveSyncConnections(ctx context.Context, userID uuid.UUID) ([]models.SyncConnection, error) {
	var connections []models.SyncConnection
	
	result := gr.GormClient.WithContext(ctx).
		Joins("JOIN sync_tokens ON sync_connections.token_id = sync_tokens.token_id").
		Where("sync_tokens.user_id = ? AND sync_connections.is_connected = ?", userID, true).
		Preload("SyncToken").
		Order("sync_connections.last_seen DESC").
		Find(&connections)
	
	if result.Error != nil {
		return nil, fmt.Errorf("failed to get active sync connections: %w", result.Error)
	}
	
	return connections, nil
}

func (gr *GormRepository) DisconnectSyncConnection(ctx context.Context, tokenID string) error {
	now := time.Now()
	
	result := gr.GormClient.WithContext(ctx).
		Model(&models.SyncConnection{}).
		Where("token_id = ? AND is_connected = ?", tokenID, true).
		Updates(map[string]interface{}{
			"is_connected":     false,
			"disconnected_at":  now,
			"updated_at":       now,
		})
	
	if result.Error != nil {
		return fmt.Errorf("failed to disconnect sync connection: %w", result.Error)
	}
	
	return nil
}

// Utility functions

// HashToken creates a secure hash of a token for storage
func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// LogSyncEvent logs a sync event to the history
func (gr *GormRepository) LogSyncEvent(ctx context.Context, userID uuid.UUID, tokenID string, eventType string, userAgent string, success bool, errorMsg string) error {
	history := &models.SyncTokenHistory{
		UserID:    userID,
		TokenID:   tokenID,
		EventType: eventType,
		EventTime: time.Now(),
		UserAgent: userAgent,
		Success:   success,
		ErrorMsg:  errorMsg,
	}
	
	return gr.CreateSyncTokenHistory(ctx, history)
}

// UpdateTokenUsage updates token usage statistics
func (gr *GormRepository) UpdateTokenUsage(ctx context.Context, userID uuid.UUID, tokenID string) error {
	now := time.Now()
	
	// Update the token
	result := gr.GormClient.WithContext(ctx).
		Model(&models.SyncToken{}).
		Where("token_id = ?", tokenID).
		Updates(map[string]interface{}{
			"last_used_at": now,
			"use_count":    gorm.Expr("use_count + 1"),
			"updated_at":   now,
		})
	
	if result.Error != nil {
		return fmt.Errorf("failed to update token usage: %w", result.Error)
	}
	
	// Log the usage event
	return gr.LogSyncEvent(ctx, userID, tokenID, "used", "", true, "")
}

// Permanently delete a sync token by tokenID
func (gr *GormRepository) DeleteSyncToken(ctx context.Context, tokenID string) error {
	result := gr.GormClient.WithContext(ctx).Where("token_id = ?", tokenID).Delete(&models.SyncToken{})
	if result.Error != nil {
		return fmt.Errorf("failed to delete sync token: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("sync token not found")
	}
	return nil
}

// Permanently delete all sync tokens for a user
func (gr *GormRepository) DeleteAllSyncTokens(ctx context.Context, userID uuid.UUID) (int64, error) {
	result := gr.GormClient.WithContext(ctx).Where("user_id = ?", userID).Delete(&models.SyncToken{})
	if result.Error != nil {
		return 0, fmt.Errorf("failed to delete all sync tokens: %w", result.Error)
	}
	return result.RowsAffected, nil
} 

// Device Sync History
func (gr *GormRepository) CreateDeviceSyncHistory(ctx context.Context, history *models.DeviceSyncHistory) error {
    if history.EventTime.IsZero() {
        history.EventTime = time.Now()
    }
    result := gr.GormClient.WithContext(ctx).Create(history)
    return result.Error
}

func (gr *GormRepository) GetUserDeviceSyncHistory(ctx context.Context, userID uuid.UUID, limit int) ([]models.DeviceSyncHistory, error) {
    var history []models.DeviceSyncHistory
    query := gr.GormClient.WithContext(ctx).Where("user_id = ?", userID).Order("event_time DESC")
    if limit > 0 {
        query = query.Limit(limit)
    }
    result := query.Find(&history)
    return history, result.Error
}
