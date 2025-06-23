package handler

import (
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	typesenseClient "github.com/fastenhealth/fasten-onprem/backend/pkg/search"
	"github.com/gin-gonic/gin"
)

type GormRepository struct {
	*database.GormRepository
}

func (gr *GormRepository) SearchResourcesHandler(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameter 'q' is required"})
		return
	}

	searchClient := &typesenseClient.SearchClient{Client: typesenseClient.Client}

	results, err := searchClient.SearchResources(query)
	if err != nil {
		gr.Logger.Errorf("Typesense search error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	// Return JSON results
	c.JSON(http.StatusOK, results)
}
