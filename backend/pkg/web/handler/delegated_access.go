package handler

import (
	"context"
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateDelegation(c *gin.Context) {
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not get current user"})
		return
	}

	var req struct {
		DelegateUserID uuid.UUID          `json:"delegateUserId"`
		ResourceType   string             `json:"resourceType"`
		ResourceID     uuid.UUID          `json:"resourceId"`
		AccessLevel    models.AccessLevel `json:"accessLevel"`
		Source         string             `json:"source"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	da := models.DelegatedAccess{
		ID:             uuid.New(),
		OwnerUserID:    currentUser.ID,
		DelegateUserID: req.DelegateUserID,
		ResourceType:   req.ResourceType,
		ResourceID:     req.ResourceID,
		AccessLevel:    req.AccessLevel,
		Source:         req.Source,
	}

	if err := databaseRepo.CreateDelegation(context.Background(), &da); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, da)
}

func ListOwnedDelegations(c *gin.Context) {
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	currentUser, err := databaseRepo.GetCurrentUser(c)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	list, err := databaseRepo.GetDelegationsByOwner(context.Background(), currentUser.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func ListSharedWithMe(c *gin.Context) {
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	currentUser, err := databaseRepo.GetCurrentUser(c)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	list, err := databaseRepo.GetDelegationsByDelegate(context.Background(), currentUser.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func DeleteDelegation(c *gin.Context) {
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	currentUser, err := databaseRepo.GetCurrentUser(c)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id := uuid.MustParse(c.Param("id"))
	if err := databaseRepo.DeleteDelegation(context.Background(), id, currentUser.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Delegation deleted successfully",
	})
}
