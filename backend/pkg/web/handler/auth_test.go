package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	mock_config "github.com/fastenhealth/fasten-onprem/backend/pkg/config/mock"
	mock_database "github.com/fastenhealth/fasten-onprem/backend/pkg/database/mock"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/web/handler"
	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestAuthSignup(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	t.Run("First user should be assigned admin role", func(t *testing.T) {
		mockDB := mock_database.NewMockDatabaseRepository(mockCtrl)
		mockConfig := mock_config.NewMockInterface(mockCtrl)

		mockDB.EXPECT().GetUserCount(gomock.Any()).Return(0, nil)
		mockDB.EXPECT().CreateUser(gomock.Any(), gomock.Any()).Do(func(_ interface{}, user *models.User) {
			assert.Equal(t, models.RoleAdmin, user.Role)
		}).Return(nil)
		mockConfig.EXPECT().GetString("jwt.issuer.key").Return("test_key")

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Set(pkg.ContextKeyTypeDatabase, mockDB)
		c.Set(pkg.ContextKeyTypeConfig, mockConfig)

		userWizard := handler.UserWizard{
			User: &models.User{
				Username: "testuser",
				Password: "testpass",
			},
		}
		jsonData, _ := json.Marshal(userWizard)
		c.Request, _ = http.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(jsonData))
		c.Request.Header.Set("Content-Type", "application/json")

		handler.AuthSignup(c)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.True(t, response["success"].(bool))
	})

	t.Run("Subsequent user should be assigned user role", func(t *testing.T) {
		mockDB := mock_database.NewMockDatabaseRepository(mockCtrl)
		mockConfig := mock_config.NewMockInterface(mockCtrl)

		mockDB.EXPECT().GetUserCount(gomock.Any()).Return(1, nil)
		mockDB.EXPECT().CreateUser(gomock.Any(), gomock.Any()).Do(func(_ interface{}, user *models.User) {
			assert.Equal(t, models.RoleUser, user.Role)
		}).Return(nil)
		mockConfig.EXPECT().GetString("jwt.issuer.key").Return("test_key")

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Set(pkg.ContextKeyTypeDatabase, mockDB)
		c.Set(pkg.ContextKeyTypeConfig, mockConfig)

		userWizard := handler.UserWizard{
			User: &models.User{
				Username: "testuser2",
				Password: "testpass2",
			},
		}
		jsonData, _ := json.Marshal(userWizard)
		c.Request, _ = http.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(jsonData))
		c.Request.Header.Set("Content-Type", "application/json")

		handler.AuthSignup(c)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.True(t, response["success"].(bool))
	})
}
