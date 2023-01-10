package utils

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"sort"
)

//default sort ASC (a, b, c, d, e...)
func SortResourceListByTitle(resourceList []*models.ResourceFhir) []*models.ResourceFhir {
	sort.SliceStable(resourceList, func(i, j int) bool {
		if resourceList[i].SortTitle != nil && resourceList[j].SortTitle != nil {
			return (*resourceList[i].SortTitle) < (*resourceList[j].SortTitle)
		} else if resourceList[i].SortTitle != nil {
			return true
		} else {
			return false
		}
	})
	return resourceList
}

//default sort DESC (today, yesterday, 2 days ago, 3 days ago...)
func SortResourceListByDate(resourceList []*models.ResourceFhir) []*models.ResourceFhir {
	sort.SliceStable(resourceList, func(i, j int) bool {
		if resourceList[i].SortDate != nil && resourceList[j].SortDate != nil {
			return (*resourceList[i].SortDate).After(*resourceList[j].SortDate)
		} else if resourceList[i].SortDate != nil {
			return true
		} else {
			return false
		}
	})
	return resourceList
}
