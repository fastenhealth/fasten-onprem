// Code generated by MockGen. DO NOT EDIT.
// Source: interface.go

// Package mock_database is a generated GoMock package.
package mock_database

import (
	context "context"
	reflect "reflect"

	models "github.com/fastenhealth/fasten-sources/clients/models"
	models0 "github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	gomock "github.com/golang/mock/gomock"
)

// MockDatabaseRepository is a mock of DatabaseRepository interface.
type MockDatabaseRepository struct {
	ctrl     *gomock.Controller
	recorder *MockDatabaseRepositoryMockRecorder
}

// MockDatabaseRepositoryMockRecorder is the mock recorder for MockDatabaseRepository.
type MockDatabaseRepositoryMockRecorder struct {
	mock *MockDatabaseRepository
}

// NewMockDatabaseRepository creates a new mock instance.
func NewMockDatabaseRepository(ctrl *gomock.Controller) *MockDatabaseRepository {
	mock := &MockDatabaseRepository{ctrl: ctrl}
	mock.recorder = &MockDatabaseRepositoryMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockDatabaseRepository) EXPECT() *MockDatabaseRepositoryMockRecorder {
	return m.recorder
}

// AddResourceAssociation mocks base method.
func (m *MockDatabaseRepository) AddResourceAssociation(ctx context.Context, source *models0.SourceCredential, resourceType, resourceId string, relatedSource *models0.SourceCredential, relatedResourceType, relatedResourceId string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "AddResourceAssociation", ctx, source, resourceType, resourceId, relatedSource, relatedResourceType, relatedResourceId)
	ret0, _ := ret[0].(error)
	return ret0
}

// AddResourceAssociation indicates an expected call of AddResourceAssociation.
func (mr *MockDatabaseRepositoryMockRecorder) AddResourceAssociation(ctx, source, resourceType, resourceId, relatedSource, relatedResourceType, relatedResourceId interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "AddResourceAssociation", reflect.TypeOf((*MockDatabaseRepository)(nil).AddResourceAssociation), ctx, source, resourceType, resourceId, relatedSource, relatedResourceType, relatedResourceId)
}

// AddResourceComposition mocks base method.
func (m *MockDatabaseRepository) AddResourceComposition(ctx context.Context, compositionTitle string, resources []*models0.ResourceFhir) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "AddResourceComposition", ctx, compositionTitle, resources)
	ret0, _ := ret[0].(error)
	return ret0
}

// AddResourceComposition indicates an expected call of AddResourceComposition.
func (mr *MockDatabaseRepositoryMockRecorder) AddResourceComposition(ctx, compositionTitle, resources interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "AddResourceComposition", reflect.TypeOf((*MockDatabaseRepository)(nil).AddResourceComposition), ctx, compositionTitle, resources)
}

// Close mocks base method.
func (m *MockDatabaseRepository) Close() error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Close")
	ret0, _ := ret[0].(error)
	return ret0
}

// Close indicates an expected call of Close.
func (mr *MockDatabaseRepositoryMockRecorder) Close() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Close", reflect.TypeOf((*MockDatabaseRepository)(nil).Close))
}

// CreateSource mocks base method.
func (m *MockDatabaseRepository) CreateSource(arg0 context.Context, arg1 *models0.SourceCredential) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "CreateSource", arg0, arg1)
	ret0, _ := ret[0].(error)
	return ret0
}

// CreateSource indicates an expected call of CreateSource.
func (mr *MockDatabaseRepositoryMockRecorder) CreateSource(arg0, arg1 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "CreateSource", reflect.TypeOf((*MockDatabaseRepository)(nil).CreateSource), arg0, arg1)
}

// CreateUser mocks base method.
func (m *MockDatabaseRepository) CreateUser(arg0 context.Context, arg1 *models0.User) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "CreateUser", arg0, arg1)
	ret0, _ := ret[0].(error)
	return ret0
}

// CreateUser indicates an expected call of CreateUser.
func (mr *MockDatabaseRepositoryMockRecorder) CreateUser(arg0, arg1 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "CreateUser", reflect.TypeOf((*MockDatabaseRepository)(nil).CreateUser), arg0, arg1)
}

// GetCurrentUser mocks base method.
func (m *MockDatabaseRepository) GetCurrentUser(arg0 context.Context) *models0.User {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetCurrentUser", arg0)
	ret0, _ := ret[0].(*models0.User)
	return ret0
}

// GetCurrentUser indicates an expected call of GetCurrentUser.
func (mr *MockDatabaseRepositoryMockRecorder) GetCurrentUser(arg0 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetCurrentUser", reflect.TypeOf((*MockDatabaseRepository)(nil).GetCurrentUser), arg0)
}

// GetFlattenedResourceGraph mocks base method.
func (m *MockDatabaseRepository) GetFlattenedResourceGraph(ctx context.Context) ([]*models0.ResourceFhir, []*models0.ResourceFhir, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetFlattenedResourceGraph", ctx)
	ret0, _ := ret[0].([]*models0.ResourceFhir)
	ret1, _ := ret[1].([]*models0.ResourceFhir)
	ret2, _ := ret[2].(error)
	return ret0, ret1, ret2
}

// GetFlattenedResourceGraph indicates an expected call of GetFlattenedResourceGraph.
func (mr *MockDatabaseRepositoryMockRecorder) GetFlattenedResourceGraph(ctx interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetFlattenedResourceGraph", reflect.TypeOf((*MockDatabaseRepository)(nil).GetFlattenedResourceGraph), ctx)
}

// GetPatientForSources mocks base method.
func (m *MockDatabaseRepository) GetPatientForSources(ctx context.Context) ([]models0.ResourceFhir, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetPatientForSources", ctx)
	ret0, _ := ret[0].([]models0.ResourceFhir)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetPatientForSources indicates an expected call of GetPatientForSources.
func (mr *MockDatabaseRepositoryMockRecorder) GetPatientForSources(ctx interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetPatientForSources", reflect.TypeOf((*MockDatabaseRepository)(nil).GetPatientForSources), ctx)
}

// GetResourceBySourceId mocks base method.
func (m *MockDatabaseRepository) GetResourceBySourceId(arg0 context.Context, arg1, arg2 string) (*models0.ResourceFhir, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetResourceBySourceId", arg0, arg1, arg2)
	ret0, _ := ret[0].(*models0.ResourceFhir)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetResourceBySourceId indicates an expected call of GetResourceBySourceId.
func (mr *MockDatabaseRepositoryMockRecorder) GetResourceBySourceId(arg0, arg1, arg2 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetResourceBySourceId", reflect.TypeOf((*MockDatabaseRepository)(nil).GetResourceBySourceId), arg0, arg1, arg2)
}

// GetResourceBySourceType mocks base method.
func (m *MockDatabaseRepository) GetResourceBySourceType(arg0 context.Context, arg1, arg2 string) (*models0.ResourceFhir, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetResourceBySourceType", arg0, arg1, arg2)
	ret0, _ := ret[0].(*models0.ResourceFhir)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetResourceBySourceType indicates an expected call of GetResourceBySourceType.
func (mr *MockDatabaseRepositoryMockRecorder) GetResourceBySourceType(arg0, arg1, arg2 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetResourceBySourceType", reflect.TypeOf((*MockDatabaseRepository)(nil).GetResourceBySourceType), arg0, arg1, arg2)
}

// GetSource mocks base method.
func (m *MockDatabaseRepository) GetSource(arg0 context.Context, arg1 string) (*models0.SourceCredential, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetSource", arg0, arg1)
	ret0, _ := ret[0].(*models0.SourceCredential)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetSource indicates an expected call of GetSource.
func (mr *MockDatabaseRepositoryMockRecorder) GetSource(arg0, arg1 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetSource", reflect.TypeOf((*MockDatabaseRepository)(nil).GetSource), arg0, arg1)
}

// GetSourceSummary mocks base method.
func (m *MockDatabaseRepository) GetSourceSummary(arg0 context.Context, arg1 string) (*models0.SourceSummary, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetSourceSummary", arg0, arg1)
	ret0, _ := ret[0].(*models0.SourceSummary)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetSourceSummary indicates an expected call of GetSourceSummary.
func (mr *MockDatabaseRepositoryMockRecorder) GetSourceSummary(arg0, arg1 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetSourceSummary", reflect.TypeOf((*MockDatabaseRepository)(nil).GetSourceSummary), arg0, arg1)
}

// GetSources mocks base method.
func (m *MockDatabaseRepository) GetSources(arg0 context.Context) ([]models0.SourceCredential, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetSources", arg0)
	ret0, _ := ret[0].([]models0.SourceCredential)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetSources indicates an expected call of GetSources.
func (mr *MockDatabaseRepositoryMockRecorder) GetSources(arg0 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetSources", reflect.TypeOf((*MockDatabaseRepository)(nil).GetSources), arg0)
}

// GetSummary mocks base method.
func (m *MockDatabaseRepository) GetSummary(ctx context.Context) (*models0.Summary, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetSummary", ctx)
	ret0, _ := ret[0].(*models0.Summary)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetSummary indicates an expected call of GetSummary.
func (mr *MockDatabaseRepositoryMockRecorder) GetSummary(ctx interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetSummary", reflect.TypeOf((*MockDatabaseRepository)(nil).GetSummary), ctx)
}

// GetUserByUsername mocks base method.
func (m *MockDatabaseRepository) GetUserByUsername(arg0 context.Context, arg1 string) (*models0.User, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetUserByUsername", arg0, arg1)
	ret0, _ := ret[0].(*models0.User)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetUserByUsername indicates an expected call of GetUserByUsername.
func (mr *MockDatabaseRepositoryMockRecorder) GetUserByUsername(arg0, arg1 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetUserByUsername", reflect.TypeOf((*MockDatabaseRepository)(nil).GetUserByUsername), arg0, arg1)
}

// ListResources mocks base method.
func (m *MockDatabaseRepository) ListResources(arg0 context.Context, arg1 models0.ListResourceQueryOptions) ([]models0.ResourceFhir, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ListResources", arg0, arg1)
	ret0, _ := ret[0].([]models0.ResourceFhir)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// ListResources indicates an expected call of ListResources.
func (mr *MockDatabaseRepositoryMockRecorder) ListResources(arg0, arg1 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ListResources", reflect.TypeOf((*MockDatabaseRepository)(nil).ListResources), arg0, arg1)
}

// Migrate mocks base method.
func (m *MockDatabaseRepository) Migrate() error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Migrate")
	ret0, _ := ret[0].(error)
	return ret0
}

// Migrate indicates an expected call of Migrate.
func (mr *MockDatabaseRepositoryMockRecorder) Migrate() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Migrate", reflect.TypeOf((*MockDatabaseRepository)(nil).Migrate))
}

// RemoveResourceAssociation mocks base method.
func (m *MockDatabaseRepository) RemoveResourceAssociation(ctx context.Context, source *models0.SourceCredential, resourceType, resourceId string, relatedSource *models0.SourceCredential, relatedResourceType, relatedResourceId string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RemoveResourceAssociation", ctx, source, resourceType, resourceId, relatedSource, relatedResourceType, relatedResourceId)
	ret0, _ := ret[0].(error)
	return ret0
}

// RemoveResourceAssociation indicates an expected call of RemoveResourceAssociation.
func (mr *MockDatabaseRepositoryMockRecorder) RemoveResourceAssociation(ctx, source, resourceType, resourceId, relatedSource, relatedResourceType, relatedResourceId interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RemoveResourceAssociation", reflect.TypeOf((*MockDatabaseRepository)(nil).RemoveResourceAssociation), ctx, source, resourceType, resourceId, relatedSource, relatedResourceType, relatedResourceId)
}

// UpsertRawResource mocks base method.
func (m *MockDatabaseRepository) UpsertRawResource(ctx context.Context, sourceCredentials models.SourceCredential, rawResource models.RawResourceFhir) (bool, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "UpsertRawResource", ctx, sourceCredentials, rawResource)
	ret0, _ := ret[0].(bool)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// UpsertRawResource indicates an expected call of UpsertRawResource.
func (mr *MockDatabaseRepositoryMockRecorder) UpsertRawResource(ctx, sourceCredentials, rawResource interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "UpsertRawResource", reflect.TypeOf((*MockDatabaseRepository)(nil).UpsertRawResource), ctx, sourceCredentials, rawResource)
}
