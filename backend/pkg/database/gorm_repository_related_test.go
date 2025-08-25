package database

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"testing"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	mock_config "github.com/fastenhealth/fasten-onprem/backend/pkg/config/mock"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	sourceModels "github.com/fastenhealth/fasten-sources/clients/models"

	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
)

type RepositoryRelatedTestSuite struct {
	suite.Suite
	MockCtrl     *gomock.Controller
	TestDatabase *os.File
	DBRepo       *GormRepository
}

func (suite *RepositoryRelatedTestSuite) SetupTest() {
	suite.MockCtrl = gomock.NewController(suite.T())

	safeTestName := strings.ReplaceAll(suite.T().Name(), "/", "_")
	dbFileName := fmt.Sprintf("related_test_%s_*.db", safeTestName)
	dbFile, err := ioutil.TempFile("", dbFileName)
	require.NoError(suite.T(), err, "Failed to create temp db file")
	suite.TestDatabase = dbFile

	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("DEBUG").AnyTimes()
	fakeConfig.EXPECT().GetBool("database.validation_mode").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetBool("database.encryption.enabled").Return(false).AnyTimes()

	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err, "Failed to create repository")

	var ok bool
	suite.DBRepo, ok = dbRepo.(*GormRepository)
	require.True(suite.T(), ok, "dbRepo is not of type *GormRepository")
}

func (suite *RepositoryRelatedTestSuite) TearDownTest() {
	suite.MockCtrl.Finish()
	if suite.DBRepo != nil && suite.DBRepo.GormClient != nil {
		sqlDB, err := suite.DBRepo.GormClient.DB()
		if err == nil && sqlDB != nil {
			errClose := sqlDB.Close()
			if errClose != nil {
				suite.T().Logf("Warning: failed to close test DB: %v", errClose)
			}
		}
	}
	err := os.Remove(suite.TestDatabase.Name())

	if err != nil {
		suite.T().Logf("Warning: failed to remove test DB file %s: %v", suite.TestDatabase.Name(), err)
	}

	_ = os.Remove(suite.TestDatabase.Name() + "-shm")
	_ = os.Remove(suite.TestDatabase.Name() + "-wal")
}

func TestRepositoryRelatedTestSuite(t *testing.T) {
	suite.Run(t, new(RepositoryRelatedTestSuite))
}

// --- Helper Functions ---

func (suite *RepositoryRelatedTestSuite) createTestUserAndContext(usernameSuffix string) (context.Context, *models.User) {
	username := fmt.Sprintf("user_%s_%s", suite.T().Name(), usernameSuffix)
	user := &models.User{
		Username: username,
		Password: "password123",
		Email:    fmt.Sprintf("%s@example.com", username),
	}
	err := suite.DBRepo.CreateUser(context.Background(), user)
	require.NoError(suite.T(), err, "Failed to create user %s", username)
	require.NotEqual(suite.T(), uuid.Nil, user.ID, "User ID should be populated after creation")
	return context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, username), user
}

func (suite *RepositoryRelatedTestSuite) createTestSourceCredential(ctx context.Context, user *models.User, credIdentifier string) *models.SourceCredential {
	sourceCred := &models.SourceCredential{
		UserID: user.ID,
	}
	err := suite.DBRepo.CreateSource(ctx, sourceCred)
	require.NoError(suite.T(), err, "Failed to create source credential for user %s (identifier: %s)", user.Username, credIdentifier)
	require.NotEqual(suite.T(), uuid.Nil, sourceCred.ID, "SourceCredential ID should be populated by CreateSource")
	return sourceCred
}

func (suite *RepositoryRelatedTestSuite) createTestResource(ctx context.Context, sourceCred *models.SourceCredential, resourceType string, resourceID string, jsonData []byte) {
	if jsonData == nil {
		jsonData = []byte(fmt.Sprintf(`{"resourceType": "%s", "id": "%s", "status": "final"}`, resourceType, resourceID)) // Minimal valid JSON
	}
	_, err := suite.DBRepo.UpsertRawResource(ctx, sourceCred, sourceModels.RawResourceFhir{
		SourceResourceType: resourceType, SourceResourceID: resourceID, ResourceRaw: jsonData,
	})
	require.NoError(suite.T(), err, "Failed to upsert resource %s/%s for source %s", resourceType, resourceID, sourceCred.ID)
}

func (suite *RepositoryRelatedTestSuite) createTestAssociation(ctx context.Context, fromSourceCred *models.SourceCredential, fromType string, fromID string, toSourceCred *models.SourceCredential, toType string, toID string) {
	err := suite.DBRepo.AddResourceAssociation(ctx, fromSourceCred, fromType, fromID, toSourceCred, toType, toID)
	require.NoError(suite.T(), err, "Failed to add association %s/%s -> %s/%s", fromType, fromID, toType, toID)
}

// --- Test Scenario Implementations ---

func (suite *RepositoryRelatedTestSuite) TestUnlink_DirectAssociationsOnly() {
	ctx, user := suite.createTestUserAndContext("direct_only")

	sourceCredP := suite.createTestSourceCredential(ctx, user, "credP_direct")
	sourceCredS := suite.createTestSourceCredential(ctx, user, "credS_direct")

	primaryResourceType := "Encounter"
	primaryResourceID := "P1_direct"
	secondaryResourceType := "Observation"
	secondaryResourceID := "S1_direct"

	suite.createTestResource(ctx, sourceCredP, primaryResourceType, primaryResourceID, nil)
	suite.createTestResource(ctx, sourceCredS, secondaryResourceType, secondaryResourceID, nil)

	// Seed P -> S
	suite.createTestAssociation(ctx, sourceCredP, primaryResourceType, primaryResourceID, sourceCredS, secondaryResourceType, secondaryResourceID)
	// Seed S -> P
	suite.createTestAssociation(ctx, sourceCredS, secondaryResourceType, secondaryResourceID, sourceCredP, primaryResourceType, primaryResourceID)

	rowsAffected, err := suite.DBRepo.UnlinkResourceWithSharedNeighbors(ctx, primaryResourceType, primaryResourceID, secondaryResourceType, secondaryResourceID)

	require.NoError(suite.T(), err)
	// Expect P->S and S->P to be targeted for removal.
	// RemoveBulkResourceAssociations deletes each distinct link.
	require.Equal(suite.T(), int64(2), rowsAffected, "Expected 2 associations to be removed")

	// Verify associations are gone
	assocsP, errP := suite.DBRepo.FindAllResourceAssociations(ctx, sourceCredP, primaryResourceType, primaryResourceID)
	require.NoError(suite.T(), errP)
	for _, a := range assocsP {
		if a.RelatedResourceSourceResourceType == secondaryResourceType && a.RelatedResourceSourceResourceID == secondaryResourceID {
			suite.T().Fatalf("P -> S association should have been deleted. Found: %+v", a)
		}
	}

	assocsS, errS := suite.DBRepo.FindAllResourceAssociations(ctx, sourceCredS, secondaryResourceType, secondaryResourceID)
	require.NoError(suite.T(), errS)
	for _, a := range assocsS {
		if a.RelatedResourceSourceResourceType == primaryResourceType && a.RelatedResourceSourceResourceID == primaryResourceID {
			suite.T().Fatalf("S -> P association should have been deleted. Found: %+v", a)
		}
	}
}

func (suite *RepositoryRelatedTestSuite) TestUnlink_WithOneSharedNeighbor() {
	ctx, user := suite.createTestUserAndContext("one_neighbor")

	sourceCredP := suite.createTestSourceCredential(ctx, user, "credP_N1")
	sourceCredS := suite.createTestSourceCredential(ctx, user, "credS_N1")
	sourceCredN1 := suite.createTestSourceCredential(ctx, user, "credN1_shared")

	primaryResourceType := "Encounter"
	primaryResourceID := "P_N1"
	secondaryResourceType := "Observation"
	secondaryResourceID := "S_N1"
	neighborResourceType := "Condition"
	neighborResourceID := "N1_shared"

	suite.createTestResource(ctx, sourceCredP, primaryResourceType, primaryResourceID, nil)
	suite.createTestResource(ctx, sourceCredS, secondaryResourceType, secondaryResourceID, nil)
	suite.createTestResource(ctx, sourceCredN1, neighborResourceType, neighborResourceID, nil)

	// Direct links
	suite.createTestAssociation(ctx, sourceCredP, primaryResourceType, primaryResourceID, sourceCredS, secondaryResourceType, secondaryResourceID) // P -> S
	suite.createTestAssociation(ctx, sourceCredS, secondaryResourceType, secondaryResourceID, sourceCredP, primaryResourceType, primaryResourceID) // S -> P

	// Links to shared neighbor N1
	suite.createTestAssociation(ctx, sourceCredP, primaryResourceType, primaryResourceID, sourceCredN1, neighborResourceType, neighborResourceID)     // P -> N1
	suite.createTestAssociation(ctx, sourceCredS, secondaryResourceType, secondaryResourceID, sourceCredN1, neighborResourceType, neighborResourceID) // S -> N1

	rowsAffected, err := suite.DBRepo.UnlinkResourceWithSharedNeighbors(ctx, primaryResourceType, primaryResourceID, secondaryResourceType, secondaryResourceID)

	require.NoError(suite.T(), err)
	// Expected to remove: P->S, S->P, and P->N1 (as per logic). So, 3 rows.
	require.Equal(suite.T(), int64(3), rowsAffected)

	// --- Verification ---

	// Check P's associations: P->S and P->N1 should be gone.
	assocsP, _ := suite.DBRepo.FindAllResourceAssociations(ctx, sourceCredP, primaryResourceType, primaryResourceID)
	pHasLinkToS := false
	pHasLinkToN1 := false
	for _, a := range assocsP {
		if a.RelatedResourceSourceResourceType == secondaryResourceType && a.RelatedResourceSourceResourceID == secondaryResourceID {
			pHasLinkToS = true
		}
		if a.RelatedResourceSourceResourceType == neighborResourceType && a.RelatedResourceSourceResourceID == neighborResourceID {
			pHasLinkToN1 = true
		}
	}
	require.False(suite.T(), pHasLinkToS, "P -> S association should have been deleted")
	require.False(suite.T(), pHasLinkToN1, "P -> N1 (shared neighbor) association should have been deleted")

	// Check S's associations: S->P should be gone. S->N1 should REMAIN.
	assocsS, _ := suite.DBRepo.FindAllResourceAssociations(ctx, sourceCredS, secondaryResourceType, secondaryResourceID)
	sHasLinkToP := false
	sHasLinkToN1 := false
	for _, a := range assocsS {
		if a.RelatedResourceSourceResourceType == primaryResourceType && a.RelatedResourceSourceResourceID == primaryResourceID {
			sHasLinkToP = true
		}
		if a.RelatedResourceSourceResourceType == neighborResourceType && a.RelatedResourceSourceResourceID == neighborResourceID {
			sHasLinkToN1 = true
		}
	}
	require.False(suite.T(), sHasLinkToP, "S -> P association should have been deleted")
	require.True(suite.T(), sHasLinkToN1, "S -> N1 association (to shared neighbor) should remain")

	// Check N1's associations: P->N1 should be gone (from N1's perspective: N1 <- P). S->N1 should remain (N1 <- S).
	assocsN1, _ := suite.DBRepo.FindAllResourceAssociations(ctx, sourceCredN1, neighborResourceType, neighborResourceID)
	n1HasLinkFromP := false
	n1HasLinkFromS := false
	for _, a := range assocsN1 {
		if a.ResourceBaseSourceResourceType == primaryResourceType && a.ResourceBaseSourceResourceID == primaryResourceID { // Link is P -> N1
			n1HasLinkFromP = true
		}
		if a.ResourceBaseSourceResourceType == secondaryResourceType && a.ResourceBaseSourceResourceID == secondaryResourceID { // Link is S -> N1
			n1HasLinkFromS = true
		}
	}
	require.False(suite.T(), n1HasLinkFromP, "Link from P to N1 (N1 <- P) should have been deleted")
	require.True(suite.T(), n1HasLinkFromS, "Link from S to N1 (N1 <- S) should remain")
}

func (suite *RepositoryRelatedTestSuite) TestUnlink_WithMultipleSharedNeighbors() {
	ctx, user := suite.createTestUserAndContext("multi_neighbor")

	sourceCredP := suite.createTestSourceCredential(ctx, user, "credP_multi")
	sourceCredS := suite.createTestSourceCredential(ctx, user, "credS_multi")
	sourceCredN1 := suite.createTestSourceCredential(ctx, user, "credN1_multi")
	sourceCredN2 := suite.createTestSourceCredential(ctx, user, "credN2_multi")
	sourceCredNpOnly := suite.createTestSourceCredential(ctx, user, "credNp_only") // P's unique neighbor
	sourceCredNsOnly := suite.createTestSourceCredential(ctx, user, "credNs_only") // S's unique neighbor

	// Define resource types and IDs
	pType, pID := "Encounter", "P_multi"
	sType, sID := "Observation", "S_multi"
	n1Type, n1ID := "Condition", "N1_multi"
	n2Type, n2ID := "Procedure", "N2_multi"
	npOnlyType, npOnlyID := "MedicationRequest", "Np_multi"
	nsOnlyType, nsOnlyID := "Device", "Ns_multi"

	// Create resources
	suite.createTestResource(ctx, sourceCredP, pType, pID, nil)
	suite.createTestResource(ctx, sourceCredS, sType, sID, nil)
	suite.createTestResource(ctx, sourceCredN1, n1Type, n1ID, nil)
	suite.createTestResource(ctx, sourceCredN2, n2Type, n2ID, nil)
	suite.createTestResource(ctx, sourceCredNpOnly, npOnlyType, npOnlyID, nil)
	suite.createTestResource(ctx, sourceCredNsOnly, nsOnlyType, nsOnlyID, nil)

	// Direct links P <-> S
	suite.createTestAssociation(ctx, sourceCredP, pType, pID, sourceCredS, sType, sID) // P -> S
	suite.createTestAssociation(ctx, sourceCredS, sType, sID, sourceCredP, pType, pID) // S -> P

	// Links to shared N1
	suite.createTestAssociation(ctx, sourceCredP, pType, pID, sourceCredN1, n1Type, n1ID) // P -> N1
	suite.createTestAssociation(ctx, sourceCredS, sType, sID, sourceCredN1, n1Type, n1ID) // S -> N1

	// Links to shared N2
	suite.createTestAssociation(ctx, sourceCredP, pType, pID, sourceCredN2, n2Type, n2ID) // P -> N2
	suite.createTestAssociation(ctx, sourceCredS, sType, sID, sourceCredN2, n2Type, n2ID) // S -> N2

	// Link P to unique Np_only
	suite.createTestAssociation(ctx, sourceCredP, pType, pID, sourceCredNpOnly, npOnlyType, npOnlyID) // P -> Np_only

	// Link S to unique Ns_only
	suite.createTestAssociation(ctx, sourceCredS, sType, sID, sourceCredNsOnly, nsOnlyType, nsOnlyID) // S -> Ns_only

	// Action
	rowsAffected, err := suite.DBRepo.UnlinkResourceWithSharedNeighbors(ctx, pType, pID, sType, sID)

	// Assertions
	require.NoError(suite.T(), err)
	// Expected to remove: P->S, S->P, P->N1, P->N2. So, 4 rows.
	require.Equal(suite.T(), int64(4), rowsAffected)

	// Verify P's associations
	assocsP, _ := suite.DBRepo.FindAllResourceAssociations(ctx, sourceCredP, pType, pID)
	foundLinksP := make(map[string]bool)
	for _, a := range assocsP {
		key := fmt.Sprintf("%s/%s", a.RelatedResourceSourceResourceType, a.RelatedResourceSourceResourceID)
		foundLinksP[key] = true
	}
	require.False(suite.T(), foundLinksP[fmt.Sprintf("%s/%s", sType, sID)], "P->S should be deleted")
	require.False(suite.T(), foundLinksP[fmt.Sprintf("%s/%s", n1Type, n1ID)], "P->N1 should be deleted")
	require.False(suite.T(), foundLinksP[fmt.Sprintf("%s/%s", n2Type, n2ID)], "P->N2 should be deleted")
	require.True(suite.T(), foundLinksP[fmt.Sprintf("%s/%s", npOnlyType, npOnlyID)], "P->Np_only should remain")
	require.Len(suite.T(), assocsP, 1, "P should only have one link remaining (to Np_only)")

	// Verify S's associations
	assocsS, _ := suite.DBRepo.FindAllResourceAssociations(ctx, sourceCredS, sType, sID)
	foundLinksS := make(map[string]bool)
	for _, a := range assocsS {
		key := fmt.Sprintf("%s/%s", a.RelatedResourceSourceResourceType, a.RelatedResourceSourceResourceID)
		foundLinksS[key] = true
	}
	require.False(suite.T(), foundLinksS[fmt.Sprintf("%s/%s", pType, pID)], "S->P should be deleted")
	require.True(suite.T(), foundLinksS[fmt.Sprintf("%s/%s", n1Type, n1ID)], "S->N1 should remain")
	require.True(suite.T(), foundLinksS[fmt.Sprintf("%s/%s", n2Type, n2ID)], "S->N2 should remain")
	require.True(suite.T(), foundLinksS[fmt.Sprintf("%s/%s", nsOnlyType, nsOnlyID)], "S->Ns_only should remain")
	require.Len(suite.T(), assocsS, 3, "S should have three links remaining (to N1, N2, Ns_only)")
}

func (suite *RepositoryRelatedTestSuite) TestUnlink_NoAssociationsExist() {
	ctx, user := suite.createTestUserAndContext("no_assoc")

	sourceCredP := suite.createTestSourceCredential(ctx, user, "credP_no_assoc")
	sourceCredS := suite.createTestSourceCredential(ctx, user, "credS_no_assoc")

	pType, pID := "Encounter", "P_no_assoc"
	sType, sID := "Observation", "S_no_assoc"

	suite.createTestResource(ctx, sourceCredP, pType, pID, nil)
	suite.createTestResource(ctx, sourceCredS, sType, sID, nil)

	// Action
	rowsAffected, err := suite.DBRepo.UnlinkResourceWithSharedNeighbors(ctx, pType, pID, sType, sID)

	// Assertions
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), int64(0), rowsAffected)

	assocsP, _ := suite.DBRepo.FindAllResourceAssociations(ctx, sourceCredP, pType, pID)
	require.Empty(suite.T(), assocsP, "P should have no associations")
	assocsS, _ := suite.DBRepo.FindAllResourceAssociations(ctx, sourceCredS, sType, sID)
	require.Empty(suite.T(), assocsS, "S should have no associations")
}

func (suite *RepositoryRelatedTestSuite) TestUnlink_PrimaryResourceNotFound() {
	ctx, user := suite.createTestUserAndContext("primary_missing")
	sourceCredS := suite.createTestSourceCredential(ctx, user, "credS_primary_missing")
	suite.createTestResource(ctx, sourceCredS, "Observation", "S_primary_missing", nil)

	_, err := suite.DBRepo.UnlinkResourceWithSharedNeighbors(ctx, "Encounter", "P_non_existent", "Observation", "S_primary_missing")

	require.Error(suite.T(), err)
	require.Contains(suite.T(), err.Error(), "could not find Encounter")
}

func (suite *RepositoryRelatedTestSuite) TestUnlink_SecondaryResourceNotFound() {
	ctx, user := suite.createTestUserAndContext("secondary_missing")
	sourceCredP := suite.createTestSourceCredential(ctx, user, "credP_secondary_missing")
	suite.createTestResource(ctx, sourceCredP, "Encounter", "P_secondary_missing", nil)

	_, err := suite.DBRepo.UnlinkResourceWithSharedNeighbors(ctx, "Encounter", "P_secondary_missing", "Observation", "S_non_existent")

	require.Error(suite.T(), err)
	require.Contains(suite.T(), err.Error(), "could not find Observation")
}

func (suite *RepositoryRelatedTestSuite) TestUnlink_ResourceFromItself() {
	ctx, user := suite.createTestUserAndContext("self_unlink")
	sourceCredA := suite.createTestSourceCredential(ctx, user, "credA_self")
	aType, aID := "Patient", "A_self"
	suite.createTestResource(ctx, sourceCredA, aType, aID, nil)

	sourceCredN := suite.createTestSourceCredential(ctx, user, "credN_self")
	nType, nID := "Condition", "N_self"
	suite.createTestResource(ctx, sourceCredN, nType, nID, nil)
	suite.createTestAssociation(ctx, sourceCredA, aType, aID, sourceCredN, nType, nID) // A -> N

	rowsAffected, err := suite.DBRepo.UnlinkResourceWithSharedNeighbors(ctx, aType, aID, aType, aID)

	require.NoError(suite.T(), err)
	// Expected: A->A (x2) are constructed but skipped by RemoveBulk.
	// Shared neighbor logic: A is P, A is S. N is neighbor of A (P). N is neighbor of A (S).
	// So, A->N is added to removal list.
	require.Equal(suite.T(), int64(1), rowsAffected, "Expected 1 association (A->N) to be removed")

	assocsA, _ := suite.DBRepo.FindAllResourceAssociations(ctx, sourceCredA, aType, aID)
	require.Empty(suite.T(), assocsA, "Resource A should have no associations left")
}
