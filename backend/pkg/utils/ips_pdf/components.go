package ips_pdf

import (
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/core"
)

// This file will house reusable maroto components.
func newTextCol(size int, value string) core.Col {
	return text.NewCol(size, value, tableTextStyle)
}