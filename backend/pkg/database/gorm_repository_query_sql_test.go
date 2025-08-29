package database

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"
	"testing"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	mock_config "github.com/fastenhealth/fasten-onprem/backend/pkg/config/mock"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/golang/mock/gomock"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
)

// Define the suite, and absorb the built-in basic suite
// functionality from testify - including a T() method which
// returns the current testing context
type RepositorySqlTestSuite struct {
	suite.Suite
	MockCtrl     *gomock.Controller
	TestDatabase *os.File

	TestRepository DatabaseRepository
}

// BeforeTest has a function to be executed right before the test starts and receives the suite and test names as input
func (suite *RepositorySqlTestSuite) BeforeTest(suiteName, testName string) {
	suite.MockCtrl = gomock.NewController(suite.T())

	dbFile, err := ioutil.TempFile("", fmt.Sprintf("%s.*.db", testName))
	if err != nil {
		log.Fatal(err)
	}
	suite.TestDatabase = dbFile

	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	fakeConfig.EXPECT().GetBool("database.validation_mode").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetBool("database.encryption.enabled").Return(false).AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)
	suite.TestRepository = dbRepo
	userModel := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	err = suite.TestRepository.CreateUser(context.Background(), userModel)
	require.NoError(suite.T(), err)

}

// AfterTest has a function to be executed right after the test finishes and receives the suite and test names as input
func (suite *RepositorySqlTestSuite) AfterTest(suiteName, testName string) {
	suite.MockCtrl.Finish()
	os.Remove(suite.TestDatabase.Name())
	os.Remove(suite.TestDatabase.Name() + "-shm")
	os.Remove(suite.TestDatabase.Name() + "-wal")
}

// In order for 'go test' to run this suite, we need to create
// a normal test function and pass our suite to suite.Run
func TestRepositorySqlTestSuite(t *testing.T) {
	suite.Run(t, new(RepositorySqlTestSuite))

}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"code": "test_code",
		},
		From: "Observation",
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT fhir.*",
			"FROM fhir_observation as fhir, json_each(fhir.code) as codeJson",
			"WHERE ((codeJson.value ->> '$.code' = ?)) AND (user_id = ?)",
			"GROUP BY `fhir`.`id`",
			"ORDER BY fhir.sort_date DESC",
		}, " "),
		sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithMultipleWhereConditions() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"code":     "test_code",
			"category": "12345",
		},
		From: "Observation",
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT fhir.*",
			"FROM fhir_observation as fhir, json_each(fhir.category) as categoryJson, json_each(fhir.code) as codeJson",
			"WHERE ((categoryJson.value ->> '$.code' = ?)) AND ((codeJson.value ->> '$.code' = ?)) AND (user_id = ?)",
			"GROUP BY `fhir`.`id`",
			"ORDER BY fhir.sort_date DESC",
		}, " "),
		sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"12345", "test_code", "00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithPrimitiveOrderByAggregation() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"activityCode": "test_code",
		},
		From:         "CarePlan",
		Aggregations: &models.QueryResourceAggregations{OrderBy: &models.QueryResourceAggregation{Field: "instantiatesUri"}},
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT fhir.*",
			"FROM fhir_care_plan as fhir, json_each(fhir.activityCode) as activityCodeJson",
			"WHERE ((activityCodeJson.value ->> '$.code' = ?)) AND (user_id = ?)",
			"GROUP BY `fhir`.`id`",
			"ORDER BY fhir.instantiatesUri ASC",
		}, " "), sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithKeywordOrderByAggregation() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select:       []string{},
		Where:        map[string]interface{}{},
		From:         "CarePlan",
		Aggregations: &models.QueryResourceAggregations{OrderBy: &models.QueryResourceAggregation{Field: "id"}},
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT fhir.*",
			"FROM fhir_care_plan as fhir",
			"WHERE (user_id = ?)",
			"GROUP BY `fhir`.`id`",
			"ORDER BY fhir.id ASC",
		}, " "), sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithComplexOrderByAggregation() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"code": "test_code",
		},
		From:         "Observation",
		Aggregations: &models.QueryResourceAggregations{OrderBy: &models.QueryResourceAggregation{Field: "valueString:value"}},
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT fhir.*",
			"FROM fhir_observation as fhir, json_each(fhir.code) as codeJson, json_each(fhir.valueString) as valueStringJson",
			"WHERE ((codeJson.value ->> '$.code' = ?)) AND (user_id = ?)",
			"GROUP BY `fhir`.`id`",
			"ORDER BY (valueStringJson.value ->> '$.value') ASC",
		}, " "), sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithPrimitiveCountByAggregation() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"activityCode": "test_code",
		},
		From:         "CarePlan",
		Aggregations: &models.QueryResourceAggregations{CountBy: &models.QueryResourceAggregation{Field: "instantiatesUri"}},
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT count(*) as value, fhir.instantiatesUri as label",
			"FROM fhir_care_plan as fhir, json_each(fhir.activityCode) as activityCodeJson",
			"WHERE ((activityCodeJson.value ->> '$.code' = ?)) AND (user_id = ?)",
			"GROUP BY `fhir`.`instantiatesUri`",
			"ORDER BY count(*) DESC",
		}, " "), sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithKeywordCountByAggregation() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"activityCode": "test_code",
		},
		From:         "CarePlan",
		Aggregations: &models.QueryResourceAggregations{CountBy: &models.QueryResourceAggregation{Field: "source_resource_type"}},
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT count(*) as value, fhir.source_resource_type as label",
			"FROM fhir_care_plan as fhir, json_each(fhir.activityCode) as activityCodeJson",
			"WHERE ((activityCodeJson.value ->> '$.code' = ?)) AND (user_id = ?)",
			"GROUP BY `fhir`.`source_resource_type`",
			"ORDER BY count(*) DESC",
		}, " "), sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithWildcardCountByAggregation() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select:       []string{},
		Where:        map[string]interface{}{},
		From:         "CarePlan",
		Aggregations: &models.QueryResourceAggregations{CountBy: &models.QueryResourceAggregation{Field: "*"}},
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT count(*) as value, fhir.source_resource_type as label",
			"FROM fhir_care_plan as fhir",
			"WHERE (user_id = ?)",
			"GROUP BY `fhir`.`source_resource_type`",
			"ORDER BY count(*) DESC",
		}, " "), sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithComplexCountByAggregation() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"code": "test_code",
		},
		From:         "Observation",
		Aggregations: &models.QueryResourceAggregations{CountBy: &models.QueryResourceAggregation{Field: "code:code"}},
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT (codeJson.value ->> '$.code') as label, count(*) as value",
			"FROM fhir_observation as fhir, json_each(fhir.code) as codeJson",
			"WHERE ((codeJson.value ->> '$.code' = ?)) AND (user_id = ?)",
			"GROUP BY (codeJson.value ->> '$.code')",
			"ORDER BY count(*) DESC",
		}, " "), sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithComplexGroupByWithOrderByMaxFnAggregation() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"code": "test_code",
		},
		From: "Observation",
		Aggregations: &models.QueryResourceAggregations{
			GroupBy: &models.QueryResourceAggregation{Field: "code:code"},
			OrderBy: &models.QueryResourceAggregation{Field: "sort_date", Function: "max"},
		},
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT (codeJson.value ->> '$.code') as label, max(fhir.sort_date) as value",
			"FROM fhir_observation as fhir, json_each(fhir.code) as codeJson",
			"WHERE ((codeJson.value ->> '$.code' = ?)) AND (user_id = ?)",
			"GROUP BY (codeJson.value ->> '$.code')",
			"ORDER BY max(fhir.sort_date) DESC",
		}, " "), sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithTokenGroupByNoModifier() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where:  map[string]interface{}{},
		From:   "Observation",
		Aggregations: &models.QueryResourceAggregations{
			GroupBy: &models.QueryResourceAggregation{Field: "code"},
		},
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT ((codeJson.value ->> '$.system') || '|' || (codeJson.value ->> '$.code')) as label, count(*) as value",
			"FROM fhir_observation as fhir, json_each(fhir.code) as codeJson",
			"WHERE (user_id = ?)",
			"GROUP BY ((codeJson.value ->> '$.system') || '|' || (codeJson.value ->> '$.code'))",
			"ORDER BY count(*) DESC",
		}, " "), sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithTokenGroupByNoModifierWithLimit() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	limit := 10
	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where:  map[string]interface{}{},
		From:   "Observation",
		Limit:  &limit,
		Aggregations: &models.QueryResourceAggregations{
			GroupBy: &models.QueryResourceAggregation{Field: "code"},
		},
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT ((codeJson.value ->> '$.system') || '|' || (codeJson.value ->> '$.code')) as label, count(*) as value",
			"FROM fhir_observation as fhir, json_each(fhir.code) as codeJson",
			"WHERE (user_id = ?)",
			"GROUP BY ((codeJson.value ->> '$.system') || '|' || (codeJson.value ->> '$.code'))",
			"ORDER BY count(*) DESC",
			"LIMIT 10",
		}, " "), sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithTokenWithNotModifier() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"code:not": "test_code",
		},
		From: "Observation",
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT fhir.*",
			"FROM fhir_observation as fhir, json_each(fhir.code) as codeJson",
			"WHERE ((codeJson.value ->> '$.code' <> ?)) AND (user_id = ?)",
			"GROUP BY `fhir`.`id`",
			"ORDER BY fhir.sort_date DESC",
		}, " "),
		sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithTokenMultipleANDValuesWithNotModifier() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"code:not": []string{"test_code", "test_code2"}, //AND condition
		},
		From: "Observation",
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT fhir.*",
			"FROM fhir_observation as fhir, json_each(fhir.code) as codeJson",
			"WHERE ((codeJson.value ->> '$.code' <> ?)) AND ((codeJson.value ->> '$.code' <> ?)) AND (user_id = ?)",
			"GROUP BY `fhir`.`id`",
			"ORDER BY fhir.sort_date DESC",
		}, " "),
		sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "test_code2", "00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithTokenMultipleORValues() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"code": "test_code,test_code2", //OR condition
		},
		From: "Observation",
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT fhir.*",
			"FROM fhir_observation as fhir, json_each(fhir.code) as codeJson",
			"WHERE ((codeJson.value ->> '$.code' = ?) OR (codeJson.value ->> '$.code' = ?)) AND (user_id = ?)",
			"GROUP BY `fhir`.`id`",
			"ORDER BY fhir.sort_date DESC",
		}, " "),
		sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "test_code2", "00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithTokenMultipleORANDValues() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"code": []string{"test_code,test_code2", "test_code3,test_code4"}, //OR-AND condition
		},
		From: "Observation",
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT fhir.*",
			"FROM fhir_observation as fhir, json_each(fhir.code) as codeJson",
			"WHERE ((codeJson.value ->> '$.code' = ?) OR (codeJson.value ->> '$.code' = ?)) AND ((codeJson.value ->> '$.code' = ?) OR (codeJson.value ->> '$.code' = ?)) AND (user_id = ?)",
			"GROUP BY `fhir`.`id`",
			"ORDER BY fhir.sort_date DESC",
		}, " "),
		sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "test_code2", "test_code3", "test_code4", "00000000-0000-0000-0000-000000000000",
	})
}

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_WithTokenMultipleModifiersMultipleANDORValues() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"code:not": []string{"test_code", "test_code2,test_code3"}, //AND-OR condition
			"code":     "test_code4,test_code5,test_code6",             //OR condition
		},
		From: "Observation",
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT fhir.*",
			"FROM fhir_observation as fhir, json_each(fhir.code) as codeJson",
			"WHERE ((codeJson.value ->> '$.code' <> ?)) AND ((codeJson.value ->> '$.code' <> ?) OR (codeJson.value ->> '$.code' <> ?)) AND ((codeJson.value ->> '$.code' = ?) OR (codeJson.value ->> '$.code' = ?) OR (codeJson.value ->> '$.code' = ?)) AND (user_id = ?)",
			"GROUP BY `fhir`.`id`",
			"ORDER BY fhir.sort_date DESC",
		}, " "),
		sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "test_code2", "test_code3", "test_code4", "test_code5", "test_code6", "00000000-0000-0000-0000-000000000000",
	})
}

// Section Vital Signs Codes Lookup

func (suite *RepositorySqlTestSuite) TestQueryResources_SQL_SectionVitalSigns_WithTokenGroupByNoModifier() {
	//setup
	sqliteRepo := suite.TestRepository.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"category": "vital-signs",
		},
		From: "Observation",
		Aggregations: &models.QueryResourceAggregations{
			GroupBy: &models.QueryResourceAggregation{Field: "code:code"},
		},
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(),
		strings.Join([]string{
			"SELECT (codeJson.value ->> '$.code') as label, count(*) as value",
			"FROM fhir_observation as fhir, json_each(fhir.category) as categoryJson, json_each(fhir.code) as codeJson",
			"WHERE ((categoryJson.value ->> '$.code' = ?)) AND (user_id = ?)",
			"GROUP BY (codeJson.value ->> '$.code')",
			"ORDER BY count(*) DESC",
		}, " "), sqlString)
	require.Equal(suite.T(), sqlParams, []interface{}{
		"vital-signs",
		"00000000-0000-0000-0000-000000000000",
	})
}
