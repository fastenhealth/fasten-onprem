package ips_pdf

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils/ips"
	"github.com/johnfercher/maroto/v2"
	"github.com/johnfercher/maroto/v2/pkg/config"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontfamily"
	"github.com/johnfercher/maroto/v2/pkg/consts/orientation"
	"github.com/johnfercher/maroto/v2/pkg/consts/pagesize"
	"github.com/johnfercher/maroto/v2/pkg/props"
)

type PDFRenderer struct{}

func NewPDFRenderer() *PDFRenderer {
	return &PDFRenderer{}
}

func (r *PDFRenderer) Render(data *ips.InternationalPatientSummaryExportData) ([]byte, error) {
	return GeneratePDF(data)
}

func GeneratePDF(data *ips.InternationalPatientSummaryExportData) ([]byte, error) {
	cfg := config.NewBuilder().
		WithPageSize(pagesize.A4).
		WithOrientation(orientation.Vertical).
		WithTopMargin(8).
		WithLeftMargin(15).
		WithRightMargin(15).
		WithDefaultFont(&props.Font{
			Family: fontfamily.Helvetica,
		}).
		Build()

	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)
    m.RegisterHeader(getDocumentHeader(data)...)
	
	renderPatientSection(m, data.Patient)
	for _, requiredSection := range pkg.IPSSectionGroupsOrdered[pkg.IPSSectionGroupsRequired] {
		if sectionData, ok := data.SectionResources[requiredSection]; ok {
			renderSection(m, requiredSection, sectionData, false)
		}
	}
	for _, recommendedSection := range pkg.IPSSectionGroupsOrdered[pkg.IPSSectionGroupsRecommended] {
		if sectionData, ok := data.SectionResources[recommendedSection]; ok {
			renderSection(m, recommendedSection, sectionData, false)
		}
	}
	for _, optionalSection := range pkg.IPSSectionGroupsOrdered[pkg.IPSSectionGroupsOptional] {
		if sectionData, ok := data.SectionResources[optionalSection]; ok {
			renderSection(m, optionalSection, sectionData, true)
		}
	}
	renderSourcesSection(m, data.Sources)

	doc, err := m.Generate()
	if err != nil {
		return nil, err
	}

	return doc.GetBytes(), nil
}

func (r *PDFRenderer) ContentType() string {
	return "application/pdf"
}

func (r *PDFRenderer) FileExtension() string {
	return "pdf"
}
