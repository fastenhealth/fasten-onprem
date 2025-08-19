package database

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"testing"

	mock_config "github.com/fastenhealth/fasten-onprem/backend/pkg/config/mock"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/golang/mock/gomock"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
)

// Define the suite, and absorb the built-in basic suite
// functionality from testify - including a T() method which
// returns the current testing context
type SqliteRepositoryTestSuite struct {
	suite.Suite
	MockCtrl     *gomock.Controller
	TestDatabase *os.File
}

// BeforeTest has a function to be executed right before the test starts and receives the suite and test names as input
func (suite *SqliteRepositoryTestSuite) BeforeTest(suiteName, testName string) {
	suite.MockCtrl = gomock.NewController(suite.T())

	dbFile, err := ioutil.TempFile("", fmt.Sprintf("%s.*.db", testName))
	if err != nil {
		log.Fatal(err)
	}
	suite.TestDatabase = dbFile

}

// AfterTest has a function to be executed right after the test finishes and receives the suite and test names as input
func (suite *SqliteRepositoryTestSuite) AfterTest(suiteName, testName string) {
	suite.MockCtrl.Finish()
	os.Remove(suite.TestDatabase.Name())
	os.Remove(suite.TestDatabase.Name() + "-shm")
	os.Remove(suite.TestDatabase.Name() + "-wal")
}

// In order for 'go test' to run this suite, we need to create
// a normal test function and pass our suite to suite.Run
func TestSqliteRepositoryTestSuite(t *testing.T) {
	suite.Run(t, new(SqliteRepositoryTestSuite))

}

// Scenario 0: repository creation with default settings (no encryption)
func (suite *SqliteRepositoryTestSuite) TestNewSqliteRepository_DefaultPragmaSettings() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	repo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)
	sqliteRepo, sqliteRepoOk := repo.(*GormRepository)
	require.True(suite.T(), sqliteRepoOk)

	//test
	var journalMode string
	resp := sqliteRepo.GormClient.Raw("PRAGMA journal_mode;").Scan(&journalMode)
	require.NoError(suite.T(), resp.Error)

	var busyTimeout int
	resp = sqliteRepo.GormClient.Raw("PRAGMA busy_timeout;").Scan(&busyTimeout)
	require.NoError(suite.T(), resp.Error)

	var foreignKeys bool
	resp = sqliteRepo.GormClient.Raw("PRAGMA foreign_keys;").Scan(&foreignKeys)
	require.NoError(suite.T(), resp.Error)

	//assert
	require.Equal(suite.T(), "wal", journalMode)
	require.Equal(suite.T(), 5000, busyTimeout)
	require.Equal(suite.T(), true, foreignKeys)
}

// Scenario 1: repository creation with encryption
func (suite *SqliteRepositoryTestSuite) TestNewSqliteRepository_WithEncryptionKey() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(true).AnyTimes()
	fakeConfig.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("database.encryption.key").Return("012345678901234567890").AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	repo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)
	sqliteRepo, sqliteRepoOk := repo.(*GormRepository)
	require.True(suite.T(), sqliteRepoOk)

	//test
	var cipher string
	resp := sqliteRepo.GormClient.Raw("PRAGMA cipher;").Scan(&cipher)
	require.NoError(suite.T(), resp.Error)

	var legacy int
	resp = sqliteRepo.GormClient.Raw("PRAGMA legacy;").Scan(&legacy)
	require.NoError(suite.T(), resp.Error)

	var hmacUse bool
	resp = sqliteRepo.GormClient.Raw("PRAGMA hmac_use;").Scan(&hmacUse)
	require.NoError(suite.T(), resp.Error)

	var kdfIter int
	resp = sqliteRepo.GormClient.Raw("PRAGMA kdf_iter;").Scan(&kdfIter)
	require.NoError(suite.T(), resp.Error)

	var legacyPageSize int
	resp = sqliteRepo.GormClient.Raw("PRAGMA legacy_page_size;").Scan(&legacyPageSize)
	require.NoError(suite.T(), resp.Error)

	//assert
	require.Equal(suite.T(), "sqlcipher", cipher)
	require.Equal(suite.T(), 3, legacy)
	require.Equal(suite.T(), 1024, legacyPageSize)
	require.Equal(suite.T(), false, hmacUse)
	require.Equal(suite.T(), 4000, kdfIter)
}

// Scenario 2: repository creation with encryption key, closing the app, and then reopening with a changed/incorrect key
func (suite *SqliteRepositoryTestSuite) TestNewSqliteRepository_WithEncryptionKey_WhenReopenWithIncorrectKeyShouldFail() {
	//setup
	fakeConfig1 := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig1.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig1.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig1.EXPECT().IsSet("database.encryption.key").Return(true).AnyTimes()
	fakeConfig1.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig1.EXPECT().GetString("database.encryption.key").Return("012345678901234567890").AnyTimes()
	fakeConfig1.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	//intialize the database with a key
	_, err := NewRepository(fakeConfig1, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)

	fakeConfig2 := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig2.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig2.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig2.EXPECT().IsSet("database.encryption.key").Return(true).AnyTimes()
	fakeConfig2.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig2.EXPECT().GetString("database.encryption.key").Return("incorrect_key_here").AnyTimes()
	fakeConfig2.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	//test
	_, err2 := NewRepository(fakeConfig2, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())

	//assert
	require.Equal(suite.T(), "failed to connect to database! encryption key may be incorrect - file is not a database", err2.Error())
}

// Scenario 3: repository creation with encryption key, closing the app, and then reopening with the correct key
func (suite *SqliteRepositoryTestSuite) TestNewSqliteRepository_WithEncryptionKey_WhenReopenWithCorrectKeyShouldPass() {
	//setup
	fakeConfig1 := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig1.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig1.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig1.EXPECT().IsSet("database.encryption.key").Return(true).AnyTimes()
	fakeConfig1.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig1.EXPECT().GetString("database.encryption.key").Return("012345678901234567890").AnyTimes()
	fakeConfig1.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	//intialize the database with a key
	_, err := NewRepository(fakeConfig1, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)

	fakeConfig2 := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig2.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig2.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig2.EXPECT().IsSet("database.encryption.key").Return(true).AnyTimes()
	fakeConfig2.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig2.EXPECT().GetString("database.encryption.key").Return("012345678901234567890").AnyTimes()
	fakeConfig2.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	//test
	_, err2 := NewRepository(fakeConfig2, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())

	//assert
	require.NoError(suite.T(), err2)
}

// Scenario 4: repository creation with encryption key, closing the app, and then reopening with deaults (no encryption)
func (suite *SqliteRepositoryTestSuite) TestNewSqliteRepository_WithEncryptionKey_WhenReopenWithNoEncryptionKeyShouldFail() {
	//setup
	fakeConfig1 := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig1.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig1.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig1.EXPECT().IsSet("database.encryption.key").Return(true).AnyTimes()
	fakeConfig1.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig1.EXPECT().GetString("database.encryption.key").Return("012345678901234567890").AnyTimes()
	fakeConfig1.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	//intialize the database with a key
	_, err := NewRepository(fakeConfig1, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)

	fakeConfig2 := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig2.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig2.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig2.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig2.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig2.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	//test
	_, err2 := NewRepository(fakeConfig2, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())

	//assert
	require.Equal(suite.T(), "failed to connect to database! encryption key may be incorrect - file is not a database", err2.Error())
}

// Scenario 5: repository creation without encryption key (defaults), closing the app, and then reopening with an encryption key
func (suite *SqliteRepositoryTestSuite) TestNewSqliteRepository_WithoutEncryption_WhenReopenWithEncryptionKeyShouldFail() {
	//setup
	fakeConfig1 := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig1.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig1.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig1.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig1.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig1.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	//intialize the database with a key
	_, err := NewRepository(fakeConfig1, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)

	fakeConfig2 := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig2.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig2.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig2.EXPECT().IsSet("database.encryption.key").Return(true).AnyTimes()
	fakeConfig2.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig2.EXPECT().GetString("database.encryption.key").Return("012345678901234567890").AnyTimes()
	fakeConfig2.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	//test
	_, err2 := NewRepository(fakeConfig2, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())

	//assert
	require.Equal(suite.T(), "failed to connect to database! encryption key may be incorrect - file is not a database", err2.Error())
}

// Scenario 6: repository creation without encryption key (defaults), closing the app, and then reopening without an encryption key
func (suite *SqliteRepositoryTestSuite) TestNewSqliteRepository_WithoutEncryption_WhenReopenWithoutEncryptionKeyShouldPass() {
	//setup
	fakeConfig1 := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig1.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig1.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig1.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig1.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig1.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	//intialize the database with a key
	_, err := NewRepository(fakeConfig1, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)

	fakeConfig2 := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig2.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig2.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig2.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig2.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig2.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	//test
	_, err2 := NewRepository(fakeConfig2, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())

	//assert
	require.NoError(suite.T(), err2)
}

// Scenario 7: repository creation with default settings (no encryption) and Typsense search enabled
func (suite *SqliteRepositoryTestSuite) TestNewSqliteRepository_WithSearchEnabled() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().IsSet("search").Return(true).AnyTimes()
	fakeConfig.EXPECT().GetString("search.uri").Return("http://localhost:8108").AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	repo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)
	sqliteRepo, sqliteRepoOk := repo.(*GormRepository)
	require.True(suite.T(), sqliteRepoOk)

	//test
	var journalMode string
	resp := sqliteRepo.GormClient.Raw("PRAGMA journal_mode;").Scan(&journalMode)
	require.NoError(suite.T(), resp.Error)

	var busyTimeout int
	resp = sqliteRepo.GormClient.Raw("PRAGMA busy_timeout;").Scan(&busyTimeout)
	require.NoError(suite.T(), resp.Error)

	var foreignKeys bool
	resp = sqliteRepo.GormClient.Raw("PRAGMA foreign_keys;").Scan(&foreignKeys)
	require.NoError(suite.T(), resp.Error)

	//assert
	require.Equal(suite.T(), "wal", journalMode)
	require.Equal(suite.T(), 5000, busyTimeout)
	require.Equal(suite.T(), true, foreignKeys)
}
