package ips_pdf

import (
	"github.com/johnfercher/maroto/v2/pkg/consts/border"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontstyle"
	"github.com/johnfercher/maroto/v2/pkg/props"
)

var h1Style = props.Text{Size: 24.0, Style: fontstyle.Bold}
var h2Style = props.Text{Size: 18.0, Style: fontstyle.Bold}
var tableTextStyle = props.Text{Left: 2, Top: 2, Right: 2, Bottom: 2}
var tableHeaderStyle = props.Text{Size: 10.0, Style: fontstyle.Bold, Left: 2, Top: 2, Right: 2, Bottom: 2}
var tableHeaderCell = props.Cell{BackgroundColor: &props.Color{Red: 220, Green: 220, Blue: 220}, BorderType: border.Full}
var tableBodyCell = props.Cell{BorderType: border.Full}
