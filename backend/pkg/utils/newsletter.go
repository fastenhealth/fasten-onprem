package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

func JoinNewsletter(name string, email string, message string, wantsToChat string) error {
	mailingListRequestData := map[string]string{
		"email":   email,
		"name":    name,
		"message": message,
		"11_chat": wantsToChat,
	}

	payloadBytes, err := json.Marshal(mailingListRequestData)
	if err != nil {
		return fmt.Errorf("an error occurred while marshalling join newsletter request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, "https://api.platform.fastenhealth.com/v1/newsletter/join", bytes.NewBuffer(payloadBytes))

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	newsletterResp, err := http.DefaultClient.Do(req)

	if err != nil {
		return fmt.Errorf("an error occurred while sending newsletter join request: %w", err)
	}
	defer newsletterResp.Body.Close()
	if newsletterResp.StatusCode >= 300 || newsletterResp.StatusCode < 200 {
		b, err := io.ReadAll(newsletterResp.Body)
		if err == nil {
			log.Printf("Error Response body: %s", string(b))
		}
		return fmt.Errorf("an error occurred while attempting to join newsletter: %d", newsletterResp.StatusCode)

	}
	return nil
}
