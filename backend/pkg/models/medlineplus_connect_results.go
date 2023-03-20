package models

import "time"

type MedlinePlusConnectResults struct {
	Feed struct {
		Base  string `json:"base"`
		Lang  string `json:"lang"`
		Xsi   string `json:"xsi"`
		Title struct {
			Type  string `json:"type"`
			Value string `json:"_value"`
		} `json:"title"`
		Updated struct {
			Value time.Time `json:"_value"`
		} `json:"updated"`
		ID struct {
			Value string `json:"_value"`
		} `json:"id"`
		Author struct {
			Name struct {
				Value string `json:"_value"`
			} `json:"name"`
			URI struct {
				Value string `json:"_value"`
			} `json:"uri"`
		} `json:"author"`
		Subtitle struct {
			Type  string `json:"type"`
			Value string `json:"_value"`
		} `json:"subtitle"`
		Category []struct {
			Scheme string `json:"scheme"`
			Term   string `json:"term"`
		} `json:"category"`
		Entry []MedlinePlusConnectResultEntry `json:"entry"`
	} `json:"feed"`
}

type MedlinePlusConnectResultEntry struct {
	Title struct {
		Value string `json:"_value"`
		Type  string `json:"type"`
	} `json:"title"`
	Link []struct {
		Href string `json:"href"`
		Rel  string `json:"rel"`
	} `json:"link"`
	ID struct {
		Value string `json:"_value"`
	} `json:"id"`
	Summary struct {
		Type  string `json:"type"`
		Value string `json:"_value"`
	} `json:"summary"`
	Updated struct {
		Value time.Time `json:"_value"`
	} `json:"updated"`
}
