package event_bus

import (
	"github.com/stretchr/testify/require"
	"testing"
)

func TestEventBusInterface(t *testing.T) {
	t.Parallel()

	eventBusInstance := new(eventBus)

	//assert
	require.Implements(t, (*Interface)(nil), eventBusInstance, "should implement the eventBus interface")
}

func TestNoopEventBusInterface(t *testing.T) {
	t.Parallel()

	noopEventBusInstance := new(noopEventBus)

	//assert
	require.Implements(t, (*Interface)(nil), noopEventBusInstance, "should implement the eventBus interface")
}
