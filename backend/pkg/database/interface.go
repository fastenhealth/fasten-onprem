package database

import (
	"context"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
)

//go:generate mockgen -source=interface.go -destination=mock/mock_database.go
type DatabaseRepository interface {
	Close() error

	CreateUser(context.Context, *models.User) error
	VerifyUser(context.Context, *models.User) error
}
