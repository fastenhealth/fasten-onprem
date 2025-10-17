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

	var req struct {
		DelegateUserID uuid.UUID          `json:"delegateUserId"`
		ResourceType   string             `json:"resourceType"`
		ResourceID     uuid.UUID          `json:"resourceId"`
		AccessLevel    models.AccessLevel `json:"accessLevel"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	ownerID := c.MustGet("userID").(uuid.UUID)

	da := models.DelegatedAccess{
		ID:             uuid.New(),
		OwnerUserID:    ownerID,
		DelegateUserID: req.DelegateUserID,
		ResourceType:   req.ResourceType,
		ResourceID:     req.ResourceID,
		AccessLevel:    req.AccessLevel,
	}

	if err := databaseRepo.CreateDelegation(context.Background(), &da); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, da)
}

func ListOwnedDelegations(c *gin.Context) {
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	ownerID := c.MustGet("userID").(uuid.UUID)
	list, err := databaseRepo.GetDelegationsByOwner(context.Background(), ownerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func ListSharedWithMe(c *gin.Context) {
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	delegateID := c.MustGet("userID").(uuid.UUID)
	list, err := databaseRepo.GetDelegationsByDelegate(context.Background(), delegateID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func DeleteDelegation(c *gin.Context) {
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	id := uuid.MustParse(c.Param("id"))
	ownerID := uuid.MustParse(c.Param("ownerID"))
	if err := databaseRepo.DeleteDelegation(context.Background(), id, ownerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
