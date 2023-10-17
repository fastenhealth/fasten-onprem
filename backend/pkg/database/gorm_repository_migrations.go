package database

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func (gr *GormRepository) Migrate() error {

	gr.Logger.Infoln("Database migration starting. Please wait, this process may take a long time....")

	gormMigrateOptions := gormigrate.DefaultOptions
	gormMigrateOptions.UseTransaction = true

	//use echo $(date '+%Y%m%d%H%M%S') to generate new ID's
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
	})

	if err := m.Migrate(); err != nil {
		gr.Logger.Errorf("Database migration failed with error. \n Please open a github issue at https://github.com/fastenhealth/fasten-onprem and attach a copy of your fasten.db file. \n %v", err)
		return err
	}
	gr.Logger.Infoln("Database migration completed successfully")
	return nil
}
