package utils

import "github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"

func PaginateResourceList(resourceList []models.ResourceBase, skip int, size int) []models.ResourceBase {
	if skip > len(resourceList) {
		skip = len(resourceList)
	}

	end := skip + size
	if end > len(resourceList) {
		end = len(resourceList)
	}

	return resourceList[skip:end]
}
