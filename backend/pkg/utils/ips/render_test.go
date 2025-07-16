package ips

import (
	"testing"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/stretchr/testify/require"
)

func TestHTMLRenderer_RenderSection(t *testing.T) {
	tests := []struct {
		name        string
		sectionType pkg.IPSSections
		sectionData *SectionData
		want        string
		wantErr     bool
	}{
		{
			name:        "Test HTMLRenderer_RenderSection",
			sectionType: pkg.IPSSectionsAllergiesIntolerances,
			sectionData: &SectionData{
				AllergyIntolerance: []database.FhirAllergyIntolerance{
					{
						ResourceBase: models.ResourceBase{
							OriginBase: models.OriginBase{
								SourceResourceType: "AllergyIntolerance",
								SourceResourceID:   "1",
							},
						},
						Code:           []byte(`[{"code":"891830","system":"http://www.nlm.nih.gov/research/umls/rxnorm","text":"banana (May be Banana (Diagnostic))"}, {"code":"93174","system":"urn:oid:2.16.840.1.113883.13.80","text":"banana (May be Banana (Diagnostic))"}]`),
						ClinicalStatus: []byte(`[{"code":"active","system":"http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical","text":"Active"}]`),
						Category:       []byte(`[{"code":"environment"}]`),
					},
				},
			},
			want:    "",
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r, err := NewHTMLRenderer()
			require.NoError(t, err)
			got, err := r.RenderSection(tt.sectionType, tt.sectionData)
			if (err != nil) != tt.wantErr {
				t.Errorf("RenderSection() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			// We don't assert the content of the HTML, just that it's not empty
			if !tt.wantErr && got == "" {
				t.Errorf("RenderSection() got = %v, want non-empty string", got)
			}
		})
	}
}
