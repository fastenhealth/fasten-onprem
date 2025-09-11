package tls

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"fmt"
	"math/big"
	"os"
	"path/filepath"
	"time"

	"github.com/sirupsen/logrus"
)

// GenerateCertificates ensures that CA and server certificates exist, generating them if necessary.
func GenerateCertificates(certDir, sharedDir string, logger *logrus.Entry) (string, string, error) {
	caCertPath := filepath.Join(sharedDir, "rootCA.pem")
	caKeyPath := filepath.Join(sharedDir, "rootCA-key.pem")
	serverCertPath := filepath.Join(certDir, "server.pem")
	serverKeyPath := filepath.Join(certDir, "server-key.pem")

	// Ensure the necessary directories exist
	if err := os.MkdirAll(certDir, 0755); err != nil {
		return "", "", fmt.Errorf("failed to create certificate directory: %w", err)
	}
	if err := os.MkdirAll(sharedDir, 0755); err != nil {
		return "", "", fmt.Errorf("failed to create shared certificate directory: %w", err)
	}

	// Check and generate CA certificate
	if _, err := os.Stat(caCertPath); os.IsNotExist(err) {
		logger.Info("CA certificate not found, generating a new one...")
		if err := generateCA(caCertPath, caKeyPath); err != nil {
			return "", "", fmt.Errorf("failed to generate CA certificate: %w", err)
		}
		logger.Info("CA certificate generated successfully.")
	} else {
		logger.Info("CA certificate found.")
	}

	// Check and generate server certificate
	if _, err := os.Stat(serverCertPath); os.IsNotExist(err) {
		logger.Info("Server certificate not found, generating a new one...")
		if err := generateServerCert(caCertPath, caKeyPath, serverCertPath, serverKeyPath, logger); err != nil {
			return "", "", fmt.Errorf("failed to generate server certificate: %w", err)
		}
		logger.Info("Server certificate generated successfully.")
	} else {
		// Check if the existing server certificate is expired
		expired, err := isCertificateExpired(serverCertPath)
		if err != nil {
			logger.Warnf("Failed to check server certificate expiration: %v. Regenerating...", err)
			if err := generateServerCert(caCertPath, caKeyPath, serverCertPath, serverKeyPath, logger); err != nil {
				return "", "", fmt.Errorf("failed to regenerate expired server certificate: %w", err)
			}
			logger.Info("Expired server certificate regenerated successfully.")
		} else if expired {
			logger.Info("Server certificate found but is expired, regenerating a new one...")
			if err := generateServerCert(caCertPath, caKeyPath, serverCertPath, serverKeyPath, logger); err != nil {
				return "", "", fmt.Errorf("failed to regenerate expired server certificate: %w", err)
			}
			logger.Info("Expired server certificate regenerated successfully.")
		} else {
			logger.Info("Server certificate found and is valid.")
		}
	}

	return serverCertPath, serverKeyPath, nil
}

// isCertificateExpired checks if a certificate at the given path is expired.
func isCertificateExpired(certPath string) (bool, error) {
	certPEM, err := os.ReadFile(certPath)
	if err != nil {
		return true, fmt.Errorf("failed to read certificate file: %w", err)
	}

	block, _ := pem.Decode(certPEM)
	if block == nil || block.Type != "CERTIFICATE" {
		return true, fmt.Errorf("failed to decode certificate PEM")
	}

	cert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return true, fmt.Errorf("failed to parse certificate: %w", err)
	}

	return time.Now().After(cert.NotAfter), nil
}

// generateCA generates a new Certificate Authority certificate and key.
func generateCA(caCertPath, caKeyPath string) error {
	ca := &x509.Certificate{
		SerialNumber: big.NewInt(2023),
		Subject: pkix.Name{
			Organization: []string{"Fasten Health"},
			CommonName:   "Fasten Health CA",
		},
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(10, 0, 0), // 10 years
		IsCA:                  true,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		BasicConstraintsValid: true,
	}

	caPrivKey, err := rsa.GenerateKey(rand.Reader, 4096)
	if err != nil {
		return fmt.Errorf("failed to generate CA private key: %w", err)
	}

	caBytes, err := x509.CreateCertificate(rand.Reader, ca, ca, &caPrivKey.PublicKey, caPrivKey)
	if err != nil {
		return fmt.Errorf("failed to create CA certificate: %w", err)
	}

	// Save CA certificate (public)
	caCertFile, err := os.Create(caCertPath)
	if err != nil {
		return fmt.Errorf("failed to create CA certificate file: %w", err)
	}
	defer caCertFile.Close()
	if err := pem.Encode(caCertFile, &pem.Block{Type: "CERTIFICATE", Bytes: caBytes}); err != nil {
		return fmt.Errorf("failed to encode CA certificate: %w", err)
	}

	// Save CA private key (private)
	caKeyFile, err := os.OpenFile(caKeyPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600) // Stricter permissions for private key
	if err != nil {
		return fmt.Errorf("failed to create CA key file: %w", err)
	}
	defer caKeyFile.Close()
	if err := pem.Encode(caKeyFile, &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(caPrivKey)}); err != nil {
		return fmt.Errorf("failed to encode CA private key: %w", err)
	}

	return nil
}

// generateServerCert generates a new server certificate and key, signed by the given CA.
func generateServerCert(caCertPath, caKeyPath, serverCertPath, serverKeyPath string, logger *logrus.Entry) error {
	// Load CA certificate
	caCertPEM, err := os.ReadFile(caCertPath)
	if err != nil {
		return fmt.Errorf("failed to read CA certificate: %w", err)
	}
	block, _ := pem.Decode(caCertPEM)
	if block == nil || block.Type != "CERTIFICATE" {
		return fmt.Errorf("failed to decode CA certificate PEM")
	}
	caCert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return fmt.Errorf("failed to parse CA certificate: %w", err)
	}

	// Load CA private key
	caKeyPEM, err := os.ReadFile(caKeyPath)
	if err != nil {
		return fmt.Errorf("failed to read CA key: %w", err)
	}
	block, _ = pem.Decode(caKeyPEM)
	if block == nil || block.Type != "RSA PRIVATE KEY" {
		return fmt.Errorf("failed to decode CA key PEM")
	}
	caPrivKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return fmt.Errorf("failed to parse CA private key: %w", err)
	}

	// Generate server certificate
	serverCert := &x509.Certificate{
		SerialNumber: big.NewInt(2024),
		Subject: pkix.Name{
			Organization: []string{"Fasten Health"},
			CommonName:   "localhost", // Use localhost for local development
		},
		NotBefore:   time.Now(),
		NotAfter:    time.Now().AddDate(1, 0, 0), // 1 year
		ExtKeyUsage: []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		KeyUsage:    x509.KeyUsageDigitalSignature,
		DNSNames:    []string{"localhost"}, // Important for local development
	}

	serverPrivKey, err := rsa.GenerateKey(rand.Reader, 4096)
	if err != nil {
		return fmt.Errorf("failed to generate server private key: %w", err)
	}

	serverBytes, err := x509.CreateCertificate(rand.Reader, serverCert, caCert, &serverPrivKey.PublicKey, caPrivKey)
	if err != nil {
		return fmt.Errorf("failed to create server certificate: %w", err)
	}

	// Save server certificate (public)
	serverCertFile, err := os.Create(serverCertPath)
	if err != nil {
		return fmt.Errorf("failed to create server certificate file: %w", err)
	}
	defer serverCertFile.Close()
	if err := pem.Encode(serverCertFile, &pem.Block{Type: "CERTIFICATE", Bytes: serverBytes}); err != nil {
		return fmt.Errorf("failed to encode server certificate: %w", err)
	}

	// Save server private key (private)
	serverKeyFile, err := os.OpenFile(serverKeyPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600) // Stricter permissions for private key
	if err != nil {
		return fmt.Errorf("failed to create server key file: %w", err)
	}
	defer serverKeyFile.Close()
	if err := pem.Encode(serverKeyFile, &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(serverPrivKey)}); err != nil {
		return fmt.Errorf("failed to encode server private key: %w", err)
	}

	return nil
}
