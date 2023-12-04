package database

import (
	"context"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	sourcePkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func (gr *GormRepository) Migrate() error {

	gr.Logger.Infoln("Database migration starting. Please wait, this process may take a long time....")

	gormMigrateOptions := gormigrate.DefaultOptions
	gormMigrateOptions.UseTransaction = true

	//use "echo $(date '+%Y%m%d%H%M%S')" to generate new ID's
	m := gormigrate.New(gr.GormClient, gormMigrateOptions, []*gormigrate.Migration{
		{
			ID: "20231017112246", // base database models //TODO: figure out how to version these correctly (SourceCredential is complicated)
			Migrate: func(tx *gorm.DB) error {

				return tx.AutoMigrate(
					&models.BackgroundJob{},
					&models.Glossary{},
					&models.SourceCredential{},
					&models.UserSettingEntry{},
					&models.User{},
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

				users := []models.User{}
				results := tx.Find(&users)
				if results.Error != nil {
					return results.Error
				}
				for _, user := range users {
					tx.Logger.Info(context.Background(), fmt.Sprintf("Creating Fasten Source Credential for user: %s", user.ID))

					fastenUserCred := models.SourceCredential{
						UserID:     user.ID,
						SourceType: sourcePkg.SourceTypeFasten,
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
	})

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
