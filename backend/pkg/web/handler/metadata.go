package handler

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"net/http"
)

func GetMetadataSource(c *gin.Context) {
	metadataSource := map[string]models.MetadataSource{

		string(pkg.SourceTypeLogica):   {Display: "Logica (Sandbox)", SourceType: pkg.SourceTypeLogica, Category: []string{"Sandbox"}, Supported: true},
		string(pkg.SourceTypeAthena):   {Display: "Athena (Sandbox)", SourceType: pkg.SourceTypeAthena, Category: []string{"Sandbox"}, Supported: true},
		string(pkg.SourceTypeHealthIT): {Display: "HealthIT (Sandbox)", SourceType: pkg.SourceTypeHealthIT, Category: []string{"Sandbox"}, Supported: true},

		// enabled
		string(pkg.SourceTypeAetna): {Display: "Aetna", SourceType: pkg.SourceTypeAetna, Category: []string{"Insurance"}, Supported: true},
		string(pkg.SourceTypeCigna): {Display: "Cigna", SourceType: pkg.SourceTypeCigna, Category: []string{"Insurance", "Hospital"}, Supported: true},

		//TODO: infinite pagination for Encounters??
		string(pkg.SourceTypeCerner): {Display: "Cerner (Sandbox)", SourceType: pkg.SourceTypeCerner, Category: []string{"Sandbox"}, Supported: true},

		//TODO: does not support $everything endpoint.
		string(pkg.SourceTypeBlueButtonMedicare): {Display: "Medicare/VA Health (BlueButton)", SourceType: pkg.SourceTypeBlueButtonMedicare, Category: []string{"Hospital"}, Supported: true},
		string(pkg.SourceTypeEpic):               {Display: "Epic (Sandbox)", SourceType: pkg.SourceTypeEpic, Category: []string{"Sandbox"}, Supported: true},
		string(pkg.SourceTypeCareEvolution):      {Display: "CareEvolution (Sandbox)", SourceType: pkg.SourceTypeCareEvolution, Category: []string{"Sandbox"}, Supported: true},

		// pending
		string(pkg.SourceTypeAnthem):           {Display: "Anthem", SourceType: pkg.SourceTypeAnthem, Category: []string{"Insurance"}},
		string(pkg.SourceTypeCedarSinai):       {Display: "Cedar Sinai", SourceType: pkg.SourceTypeCedarSinai, Category: []string{"Hospital"}},
		string(pkg.SourceTypeCommonSpirit):     {Display: "Common Spirit", SourceType: pkg.SourceTypeCommonSpirit, Category: []string{"Hospital"}},
		string(pkg.SourceTypeDeltaDental):      {Display: "Delta Dental", SourceType: pkg.SourceTypeDeltaDental, Category: []string{"Insurance"}},
		string(pkg.SourceTypeDignityHealth):    {Display: "Dignity Health", SourceType: pkg.SourceTypeDignityHealth, Category: []string{"Hospital"}},
		string(pkg.SourceTypeHCAHealthcare):    {Display: "HCA Healthcare", SourceType: pkg.SourceTypeHCAHealthcare, Category: []string{"Insurance"}},
		string(pkg.SourceTypeHumana):           {Display: "Humana", SourceType: pkg.SourceTypeHumana, Category: []string{"Insurance"}},
		string(pkg.SourceTypeKaiser):           {Display: "Kaiser", SourceType: pkg.SourceTypeKaiser, Category: []string{"Hospital", "Insurance"}},
		string(pkg.SourceTypeMetlife):          {Display: "Metlife", SourceType: pkg.SourceTypeMetlife, Category: []string{"Insurance"}},
		string(pkg.SourceTypeProvidence):       {Display: "Providence", SourceType: pkg.SourceTypeProvidence, Category: []string{"Hospital"}},
		string(pkg.SourceTypeStanford):         {Display: "Stanford Healthcare", SourceType: pkg.SourceTypeStanford, Category: []string{"Hospital"}},
		string(pkg.SourceTypeSutter):           {Display: "Sutter", SourceType: pkg.SourceTypeSutter, Category: []string{"Hospital"}},
		string(pkg.SourceTypeTrinity):          {Display: "Trinity", SourceType: pkg.SourceTypeTrinity, Category: []string{"Hospital"}},
		string(pkg.SourceTypeUCSF):             {Display: "UCSF", SourceType: pkg.SourceTypeUCSF, Category: []string{"Hospital"}},
		string(pkg.SourceTypeUnitedHealthcare): {Display: "United Healthcare", SourceType: pkg.SourceTypeUnitedHealthcare, Category: []string{"Insurance"}},
		string(pkg.SourceTypeVerity):           {Display: "Verity", SourceType: pkg.SourceTypeVerity, Category: []string{"Hospital"}},
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": metadataSource})
}
