//go:generate go run related_versions.go
package main

import (
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/version"
	"golang.org/x/mod/modfile"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const relativeToRepoRoot = "../../"

func main() {
	log.Printf("generating related_versions.json file...")
	relatedVersions, err := getRelatedVersions()
	if err != nil {
		log.Fatalf("could not get version info: %s", err)
	}

	//remove fasten- prefix from keys
	newRelatedVersion := map[string]string{}
	for k, v := range relatedVersions {
		newRelatedVersion[strings.TrimPrefix(k, "fasten-")] = v
	}

	relatedVersionsJson, err := json.Marshal(newRelatedVersion)
	if err != nil {
		log.Fatalf("could not write related version info: %s", err)
	}

	err = os.WriteFile(filepath.Join(relativeToRepoRoot, "backend/resources", "related_versions.json"), relatedVersionsJson, 0644)
	if err != nil {
		log.Fatalf("could not write version info json: %s", err)
	}
}

func getRelatedVersions() (map[string]string, error) {
	goModBytes, err := ioutil.ReadFile(filepath.Join(relativeToRepoRoot, "go.mod"))
	if err != nil {
		return nil, fmt.Errorf("could not read go.mod file: %w", err)
	}

	modFile, err := modfile.Parse("go.mod", goModBytes, nil)
	if err != nil {
		return nil, fmt.Errorf("could not parse go.mod file: %w", err)
	}

	fastenOnpremVersion := version.VERSION
	fastenSourcesVersion := findDependencyVersion("github.com/fastenhealth/fasten-sources", modFile)

	return map[string]string{
		"fasten-onprem":  fastenOnpremVersion,
		"fasten-sources": fastenSourcesVersion,
	}, nil
}

func findDependencyVersion(modulePath string, modFile *modfile.File) string {
	//check replacements first by iterating through the replace statements
	for _, replace := range modFile.Replace {
		if replace.Old.Path == modulePath {
			if len(replace.New.Version) > 0 {
				return replace.New.Version
			} else {
				relativeNewPath := filepath.Join(relativeToRepoRoot, replace.New.Path)

				log.Printf("Attempting to get git version for %s", relativeNewPath)
				//replace.New.Path is a relative path to the dependency directory
				//use git describe --tags command
				gitCommand := exec.Command("git", "describe", "--tags")
				gitCommand.Dir = relativeNewPath
				gitCommandOutput := new(strings.Builder)
				gitCommand.Stdout = gitCommandOutput
				gitCommand.Run()
				return strings.TrimSpace(gitCommandOutput.String())
			}
		}
	}

	//find modulePath dependency in modFile Require
	for _, require := range modFile.Require {
		if require.Mod.Path == modulePath {
			//strip "v" prefix from version
			if strings.HasPrefix(require.Mod.Version, "v") {
				return require.Mod.Version[1:]
			} else {
				return require.Mod.Version
			}
		}
	}
	return "unknown"
}
