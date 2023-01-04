package models

import (
	sourceModels "github.com/fastenhealth/fasten-sources/clients/models"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestSourceCredentialInterface(t *testing.T) {
	t.Parallel()

	sourceCred := new(SourceCredential)

	//assert
	require.Implements(t, (*sourceModels.SourceCredential)(nil), sourceCred, "should implement the SourceCredential interface from fasten-sources")
}
