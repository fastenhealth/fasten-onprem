package base

import "github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"

type Client interface {
	GetRequest(resourceSubpath string, decodeModelPtr interface{}) error
	SyncAll(db database.DatabaseRepository) error

	//PatientProfile() (models.PatientProfile, error)
	//Allergies()
	//Encounters()
	//Immunizations()
	//Instructions()
	//Medications()
	//Narratives()
	//Organizations()
	//PlansOfCare()
	//Problems()
	//Procedures()
	//TestResults()
	//Vitals()
	//CCD()
	//Demographics()
	//SocialHistory()
}
