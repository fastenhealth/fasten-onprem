package database

import (
	"context"
	"fmt"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
)

// UnlinkResourceWithSharedNeighbors removes all direct associations between a primary resource
// (specified by resourceType and resourceId) and a related resource (specified by
// relatedResourceType and relatedResourceId).
//
// Crucially, it also handles unlinking via "shared neighbors": if both the primary
// resource and the related resource are associated with a common third resource (a "neighbor"),
// this function will remove the association between the primary resource and that shared neighbor.
// The association between the related resource and the shared neighbor remains intact.
//
// This logic is primarily designed for scenarios like unlinking an Encounter from another
// resource (e.g., an Observation), where if both the Encounter and the Observation are linked
// to a Condition (the shared neighbor), the Encounter's link to the Condition should also be severed.
func (gr *GormRepository) UnlinkResourceWithSharedNeighbors(
	ctx context.Context,
	resourceType string,
	resourceId string,
	relatedResourceType string,
	relatedResourceId string,
) (int64, error) {
	// get resource models
	resource, err := gr.GetResourceByResourceTypeAndId(ctx, resourceType, resourceId)
	if err != nil {
		return 0, fmt.Errorf("could not find %s", resourceType)
	}
	relatedResource, err := gr.GetResourceByResourceTypeAndId(ctx, relatedResourceType, relatedResourceId)
	if err != nil {
		return 0, fmt.Errorf("could not find %s", relatedResourceType)
	}

	// get source credential models
	resourceSource, err := gr.GetSource(ctx, resource.SourceID.String())
	if err != nil {
		return 0, fmt.Errorf("could not find source for %s", resourceType)
	}
	relatedResourceSource, err := gr.GetSource(ctx, relatedResource.SourceID.String())
	if err != nil {
		return 0, fmt.Errorf("could not find source for %s", relatedResourceType)
	}

	var associationsToRemove []models.RelatedResource

	// first add the possible direct/primary associations between the encounter and the resource
	associationsToRemove = append(associationsToRemove, models.RelatedResource{
		ResourceBaseUserID:                resourceSource.UserID,
		ResourceBaseSourceID:              resourceSource.ID,
		ResourceBaseSourceResourceType:    resourceType,
		ResourceBaseSourceResourceID:      resourceId,
		RelatedResourceUserID:             relatedResourceSource.UserID,
		RelatedResourceSourceID:           relatedResourceSource.ID,
		RelatedResourceSourceResourceType: relatedResourceType,
		RelatedResourceSourceResourceID:   relatedResourceId,
	})
	associationsToRemove = append(associationsToRemove, models.RelatedResource{
		ResourceBaseUserID:                relatedResourceSource.UserID,
		ResourceBaseSourceID:              relatedResourceSource.ID,
		ResourceBaseSourceResourceType:    relatedResourceType,
		ResourceBaseSourceResourceID:      relatedResourceId,
		RelatedResourceUserID:             resourceSource.UserID,
		RelatedResourceSourceID:           resourceSource.ID,
		RelatedResourceSourceResourceType: resourceType,
		RelatedResourceSourceResourceID:   resourceId,
	})

	// now we need to add the secondary associations that link the encounter and the resource
	// Encounter -> X or Encounter <- X, where Resource -> X or Resource <- X
	resourceAssociations, err := gr.FindAllResourceAssociations(ctx, resourceSource, resourceType, resourceId)
	if err != nil {
		return 0, fmt.Errorf("could not get all relations for the %s", resourceType)
	}
	relatedResourceAssociations, err := gr.FindAllResourceAssociations(ctx, relatedResourceSource, relatedResourceType, relatedResourceId)
	if err != nil {
		return 0, fmt.Errorf("could not get all relations for the %s", relatedResourceType)
	}

	resourceNeighborsMap := buildNeighborsMapFromAssociations(resourceAssociations, resourceId, resourceType)
	relatedResourceNeighborsMap := buildNeighborsMapFromAssociations(relatedResourceAssociations, relatedResourceId, relatedResourceType)

	for key := range relatedResourceNeighborsMap {
		if relation, ok := resourceNeighborsMap[key]; ok {
			associationsToRemove = append(associationsToRemove, relation)
		}
	}

	rowsAffected, err := gr.RemoveBulkResourceAssociations(ctx, associationsToRemove)
	if err != nil {
		return 0, fmt.Errorf("could not remove resource associations")
	}

	return rowsAffected, nil
}

func buildNeighborsMapFromAssociations(associations []models.RelatedResource, resourceId string, resourceType string) map[string]models.RelatedResource {
	resourceNeighborsMap := make(map[string]models.RelatedResource)
	for _, association := range associations {
		var key string
		if association.ResourceBaseSourceResourceID == resourceId && association.ResourceBaseSourceResourceType == resourceType {
			key = fmt.Sprintf("%s-%s-%s", association.RelatedResourceSourceID, association.RelatedResourceSourceResourceType, association.RelatedResourceSourceResourceID)
		} else {
			key = fmt.Sprintf("%s-%s-%s", association.ResourceBaseSourceID, association.ResourceBaseSourceResourceType, association.ResourceBaseSourceResourceID)
		}
		resourceNeighborsMap[key] = association
	}

	return resourceNeighborsMap
}
