package errors_test

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg/errors"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestErrors(t *testing.T) {
	t.Parallel()

	//assert
	require.Implements(t, (*error)(nil), errors.ConfigFileMissingError("test"), "should implement the error interface")
	require.Implements(t, (*error)(nil), errors.ConfigValidationError("test"), "should implement the error interface")
}
