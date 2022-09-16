package base

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"os"
)

//go:generate mockgen -source=interface.go -destination=mock/mock_client.go
type Client interface {
	GetRequest(resourceSubpath string, decodeModelPtr interface{}) error
	SyncAll(db database.DatabaseRepository) error

	//Manual client ONLY functions
	SyncAllBundle(db database.DatabaseRepository, bundleFile *os.File) error
}

type ResourceInterface interface {
	ResourceRef() (string, *string)
}
