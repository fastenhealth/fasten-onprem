package database

import (
	"context"
	"fmt"
	_20231017112246 "github.com/fastenhealth/fasten-onprem/backend/pkg/database/migrations/20231017112246"
	_20231201122541 "github.com/fastenhealth/fasten-onprem/backend/pkg/database/migrations/20231201122541"
	_0240114092806 "github.com/fastenhealth/fasten-onprem/backend/pkg/database/migrations/20240114092806"
	_20240114103850 "github.com/fastenhealth/fasten-onprem/backend/pkg/database/migrations/20240114103850"
	_20240208112210 "github.com/fastenhealth/fasten-onprem/backend/pkg/database/migrations/20240208112210"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	sourceCatalog "github.com/fastenhealth/fasten-sources/catalog"
	sourcePkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/go-gormigrate/gormigrate/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"log"
)

func (gr *GormRepository) Migrate() error {

	gr.Logger.Infoln("Database migration starting. Please wait, this process may take a long time....")

	gormMigrateOptions := gormigrate.DefaultOptions
	gormMigrateOptions.UseTransaction = true

	//use "echo $(date '+%Y%m%d%H%M%S')" to generate new ID's
	m := gormigrate.New(gr.GormClient, gormMigrateOptions, []*gormigrate.Migration{
		{
			ID: "20231017112246",
			Migrate: func(tx *gorm.DB) error {

				return tx.AutoMigrate(
					&_20231017112246.BackgroundJob{},
					&_20231017112246.Glossary{},
					&_20231017112246.SourceCredential{},
					&_20231017112246.UserSettingEntry{},
					&_20231017112246.User{},
				)
			},
		},
		{
			ID: "20231017113858", // FHIR Resource Database models.
			Migrate: func(tx *gorm.DB) error {

				//automigrate Fhir Resource Tables
				return databaseModel.Migrate(tx)
			},
		},
		{
			ID: "20231201122541", // Adding Fasten Source Credential for each user
			Migrate: func(tx *gorm.DB) error {

				users := []_20231201122541.User{}
				results := tx.Find(&users)
				if results.Error != nil {
					return results.Error
				}
				for _, user := range users {
					tx.Logger.Info(context.Background(), fmt.Sprintf("Creating Fasten Source Credential for user: %s", user.ID))

					fastenUserCred := _20231201122541.SourceCredential{
						UserID:     user.ID,
						SourceType: string(sourcePkg.PlatformTypeFasten),
					}
					fastenUserCredCreateResp := tx.Create(&fastenUserCred)
					if fastenUserCredCreateResp.Error != nil {
						tx.Logger.Error(context.Background(), fmt.Sprintf("An error occurred creating Fasten Source Credential for user: %s", user.ID))
						return fastenUserCredCreateResp.Error
					}
				}
				return nil
			},
		},
		{
			ID: "20240114092806", // Adding additional fields to Source Credential
			Migrate: func(tx *gorm.DB) error {

				err := tx.AutoMigrate(
					&_0240114092806.SourceCredential{},
				)
				if err != nil {
					return err
				}

				//attempt to populate the endpoint id, portal id and brand id for each existing source credential
				sourceCredentials := []_0240114092806.SourceCredential{}
				results := tx.Find(&sourceCredentials)
				if results.Error != nil {
					return results.Error
				}

				for ndx, _ := range sourceCredentials {
					sourceCredential := &sourceCredentials[ndx]

					if sourceCredential.SourceType == string(sourcePkg.PlatformTypeFasten) || sourceCredential.SourceType == string(sourcePkg.PlatformTypeManual) {
						tx.Logger.Info(context.Background(), fmt.Sprintf("Updating Legacy SourceType (%s) to PlatformType: %s", sourceCredential.SourceType, sourceCredential.ID))

						sourceCredential.PlatformType = string(sourceCredential.SourceType)

						fastenUpdateSourceCredential := tx.Save(sourceCredential)
						if fastenUpdateSourceCredential.Error != nil {
							tx.Logger.Error(context.Background(), fmt.Sprintf("An error occurred update Fasten Source Credential: %s", sourceCredential.ID))
							return fastenUpdateSourceCredential.Error
						}

						continue
					}

					tx.Logger.Info(context.Background(), fmt.Sprintf("Mapping Legacy SourceType (%s) to Brand, Portal and Endpoint IDs: %s", sourceCredential.SourceType, sourceCredential.ID))

					matchingBrand, matchingPortal, matchingEndpoint, endpointEnv, err := sourceCatalog.GetPatientAccessInfoForLegacySourceType(sourceCredential.SourceType, sourceCredential.ApiEndpointBaseUrl)
					if err != nil {
						log.Printf("An error occurred getting Patient Access Info for Legacy SourceType: %s", sourceCredential.SourceType)
						tx.Logger.Error(context.Background(), err.Error())
						return err
					}
					portalId := uuid.MustParse(matchingPortal.Id)
					sourceCredential.PortalID = &portalId
					brandId := uuid.MustParse(matchingBrand.Id)
					sourceCredential.Display = matchingPortal.Name
					sourceCredential.BrandID = &brandId
					sourceCredential.EndpointID = uuid.MustParse(matchingEndpoint.Id)
					sourceCredential.PlatformType = string(matchingEndpoint.GetPlatformType())
					sourceCredential.LighthouseEnvType = endpointEnv

					fastenUpdateSourceCredential := tx.Save(sourceCredential)
					if fastenUpdateSourceCredential.Error != nil {
						tx.Logger.Error(context.Background(), fmt.Sprintf("An error occurred update Fasten Source Credential: %s", sourceCredential.ID))
						return fastenUpdateSourceCredential.Error
					}
				}
				return nil
			},
		},
		{
			ID: "20240114103850", // cleanup unnecessary fields, now that we're using Brands, Portals and Endpoints.
			Migrate: func(tx *gorm.DB) error {

				return tx.AutoMigrate(
					&_20240114103850.SourceCredential{},
				)
			},
		},
		{
			ID: "20240208112210", // add system settings
			Migrate: func(tx *gorm.DB) error {

				return tx.AutoMigrate(
					&_20240208112210.SystemSettingEntry{},
				)
			},
		},
	})

	// run when database is empty
	//m.InitSchema(func(tx *gorm.DB) error {
	//	err := tx.AutoMigrate(
	//		&models.BackgroundJob{},
	//		&models.Glossary{},
	//		&models.SourceCredential{},
	//		&models.UserSettingEntry{},
	//		&models.User{},
	//	)
	//	if err != nil {
	//		return err
	//	}
	//	return nil
	//})

	if err := m.Migrate(); err != nil {
		gr.Logger.Errorf("Database migration failed with error. \n Please open a github issue at https://github.com/fastenhealth/fasten-onprem. \n %v", err)
		return err
	}

	//TODO: final migration step. This should not be necessary once we do true migrations for the databaseModels.
	if err := databaseModel.Migrate(gr.GormClient); err != nil {
		gr.Logger.Errorf("Final Database migration failed with error.\n Please open a github issue at https://github.com/fastenhealth/fasten-onprem. \n %v", err)
	}

	gr.Logger.Infoln("Database migration completed successfully")
	return nil
}
