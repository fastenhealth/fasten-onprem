package models_test

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestOriginBaserInterface(t *testing.T) {
	t.Parallel()

	originBase := new(models.OriginBase)

	//assert
	require.Implements(t, (*models.OriginBaser)(nil), originBase, "should implement the OriginBase interface")
}
