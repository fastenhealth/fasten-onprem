package database

import (
	sourceModels "github.com/fastenhealth/fasten-sources/clients/models"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestSourceCredentialInterface(t *testing.T) {
	t.Parallel()

	repo := new(SqliteRepository)

	//assert
	require.Implements(t, (*sourceModels.DatabaseRepository)(nil), repo, "should implement the DatabaseRepository interface from fasten-sources")
	require.Implements(t, (*DatabaseRepository)(nil), repo, "should implement the DatabaseRepository interface")
}
