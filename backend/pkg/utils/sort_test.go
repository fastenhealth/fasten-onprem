package utils

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/stretchr/testify/require"
	"testing"
	"time"
)

func TestSortResourceListByTitle(t *testing.T) {
	//setup
	a := "a"
	g := "g"
	p := "p"
	z := "z"
	resources := []*models.ResourceBase{
		{
			SortTitle: &a,
		},
		{
			SortTitle: &g,
		},
		{
			SortTitle: &z,
		},
		{
			SortTitle: &p,
		},
	}

	//test
	resources = SortResourcePtrListByTitle(resources)

	//assert
	require.Equal(t, "a", *resources[0].SortTitle)
	require.Equal(t, "g", *resources[1].SortTitle)
	require.Equal(t, "p", *resources[2].SortTitle)
	require.Equal(t, "z", *resources[3].SortTitle)
}

func TestSortResourceListByDate(t *testing.T) {
	//setup
	a := time.Now().Add(time.Hour * -24)
	g := time.Now().Add(time.Hour * -48)
	p := time.Now().Add(time.Hour * -72)
	z := time.Now().Add(time.Hour * -100)
	resources := []*models.ResourceBase{
		{
			SortDate: &a,
		},
		{
			SortDate: &g,
		},
		{
			SortDate: &z,
		},
		{
			SortDate: &p,
		},
	}

	//test
	resources = SortResourcePtrListByDate(resources)

	//assert
	require.Equal(t, a, *resources[0].SortDate)
	require.Equal(t, g, *resources[1].SortDate)
	require.Equal(t, p, *resources[2].SortDate)
	require.Equal(t, z, *resources[3].SortDate)
}
