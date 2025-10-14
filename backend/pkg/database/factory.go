package database

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/errors"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/sirupsen/logrus"
)

func NewRepository(appConfig config.Interface, globalLogger logrus.FieldLogger, eventBus event_bus.Interface) (DatabaseRepository, error) {
	switch pkg.DatabaseRepositoryType(appConfig.GetString("database.type")) {
	case pkg.DatabaseRepositoryTypeSqlite:
		return newSqliteRepository(appConfig, globalLogger, eventBus, appConfig.GetBool("database.validation_mode"))
	case pkg.DatabaseRepositoryTypePostgres:
		return newPostgresRepository(appConfig, globalLogger, eventBus)
	default:
		return nil, errors.DatabaseTypeNotSupportedError(appConfig.GetString("database.type"))
	}
}
