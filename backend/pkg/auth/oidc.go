package auth

import (
	"context"
	"fmt"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

type OIDCConfig struct {
	Name         string
	Issuer       string
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type OIDCProvider struct {
	Config   OIDCConfig
	Provider *oidc.Provider
	OAuth2   *oauth2.Config
}

type OIDCManager struct {
	Providers map[string]*OIDCProvider
}

// ProviderInfo contains public information about a configured OIDC provider.
type ProviderInfo struct {
	Name string `json:"name"`
}

func NewOIDCManager(ctx context.Context, configs []OIDCConfig) (*OIDCManager, error) {
	mgr := &OIDCManager{Providers: make(map[string]*OIDCProvider)}

	for _, cfg := range configs {
		provider, err := oidc.NewProvider(ctx, cfg.Issuer)
		if err != nil {
			return nil, fmt.Errorf("init provider %s: %w", cfg.Name, err)
		}

		mgr.Providers[cfg.Name] = &OIDCProvider{
			Config:   cfg,
			Provider: provider,
			OAuth2: &oauth2.Config{
				ClientID:     cfg.ClientID,
				ClientSecret: cfg.ClientSecret,
				Endpoint:     provider.Endpoint(),
				RedirectURL:  cfg.RedirectURL,
				Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
			},
		}
	}
	return mgr, nil
}

func (m *OIDCManager) GetProviders() []ProviderInfo {
	// Pre-allocate a slice with the right capacity for efficiency
	providerList := make([]ProviderInfo, 0, len(m.Providers))

	for name := range m.Providers {
		providerList = append(providerList, ProviderInfo{Name: name})
	}

	return providerList
}
