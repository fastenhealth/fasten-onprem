// ocr-service/main.go
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"

	"github.com/otiai10/gosseract/v2"
)

func ocrHandler(w http.ResponseWriter, r *http.Request) {
	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "File error", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Save uploaded file
	tmpDir := "/tmp/uploads"
	os.MkdirAll(tmpDir, 0755)

	tmpPath := filepath.Join(tmpDir, header.Filename)
	out, err := os.Create(tmpPath)
	if err != nil {
		http.Error(w, "Unable to write file", http.StatusInternalServerError)
		return
	}
	defer out.Close()
	defer os.Remove(tmpPath)

	_, err = io.Copy(out, file)
	if err != nil {
		http.Error(w, "Failed to save uploaded file", http.StatusInternalServerError)
		return
	}

	ext := strings.ToLower(filepath.Ext(tmpPath))
	var result strings.Builder

	switch ext {
	case ".pdf":
		// Convert PDF to images using pdftoppm
		base := filepath.Join(tmpDir, "page")
		cmd := exec.Command("pdftoppm", "-png", tmpPath, base)
		err := cmd.Run()
		if err != nil {
			http.Error(w, "PDF to image conversion failed", http.StatusInternalServerError)
			return
		}

		// OCR all generated PNGs (e.g. page-1.png, page-2.png...)
		files, _ := filepath.Glob(base + "-*.png")
		sort.Strings(files) // Ensure proper page order
		client := gosseract.NewClient()
		defer client.Close()

		for _, img := range files {
			client.SetImage(img)
			text, err := client.Text()
			if err != nil {
				http.Error(w, "OCR failed on image: "+img, http.StatusInternalServerError)
				return
			}
			result.WriteString(text + "\n")
			os.Remove(img)
		}

	default:
		// Assume it's an image
		client := gosseract.NewClient()
		defer client.Close()
		client.SetImage(tmpPath)
		text, err := client.Text()
		if err != nil {
			http.Error(w, "OCR failed", http.StatusInternalServerError)
			return
		}
		result.WriteString(text)
	}

	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte(result.String()))
}

func main() {
	os.MkdirAll("/tmp/uploads", 0755)
	http.HandleFunc("/ocr", ocrHandler)
	fmt.Println("OCR service running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
