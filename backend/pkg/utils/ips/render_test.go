package ips

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestNarrative_RenderSection(t *testing.T) {
	tests := []struct {
		name        string
		sectionType pkg.IPSSections
		resources   []database.IFhirResourceModel

		want    string
		wantErr bool
	}{
		{
			name:        "Test Narrative_RenderSection",
			sectionType: pkg.IPSSectionsAllergiesIntolerances,
			resources: []database.IFhirResourceModel{
				&database.FhirAllergyIntolerance{
					ResourceBase: models.ResourceBase{
						OriginBase: models.OriginBase{
							SourceResourceType: "AllergyIntolerance",
							SourceResourceID:   "1",
						},
					},
					Code: []byte(`[
							{"code":"891830","system":"http://www.nlm.nih.gov/research/umls/rxnorm","text":"banana (May be Banana (Diagnostic))"},
							{"code":"93174","system":"urn:oid:2.16.840.1.113883.13.80","text":"banana (May be Banana (Diagnostic))"}
						]`),
					ClinicalStatus: []byte(`[{"code":"active","system":"http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical","text":"Active"}]`),
					Category:       []byte(`[{"code":"environment"}]`),
				},
			},
			want:    "",
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			n, err := NewNarrative()
			require.NoError(t, err)
			got, err := n.RenderSection(tt.sectionType, tt.resources)
			require.NoError(t, err, "RenderSection() error = %v, wantErr %v", err, tt.wantErr)
			if got != tt.want {
				t.Errorf("RenderSection() got = %v, want %v", got, tt.want)
			}
		})
	}
}
