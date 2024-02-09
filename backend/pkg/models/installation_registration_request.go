package models

type InstallationRegistrationRequest struct {
	// AdministratorEmail specifies email address for the administrator of the installation
	AdministratorEmail string `json:"administrator_email,omitempty"` //opt-in

	SoftwareArchitecture string `json:"software_architecture,omitempty"`
	SoftwareOS           string `json:"software_os,omitempty"`

	FastenDesktopVersion string `json:"fasten_desktop_version,omitempty"`
	FastenOnpremVersion  string `json:"fasten_onprem_version,omitempty"`
	FastenSourcesVersion string `json:"fasten_sources_version,omitempty"`
}
