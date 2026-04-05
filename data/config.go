package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// Set this to pin a specific version. Leave empty to auto-detect latest.
var championsVersion = ""

func getChampionsVersion() (string, error) {
	if championsVersion != "" {
		return championsVersion, nil
	}

	resp, err := http.Get("https://ddragon.leagueoflegends.com/api/versions.json")
	if err != nil {
		return "", fmt.Errorf("failed to fetch versions: %w", err)
	}
	defer resp.Body.Close()

	var versions []string
	if err := json.NewDecoder(resp.Body).Decode(&versions); err != nil {
		return "", fmt.Errorf("failed to decode versions: %w", err)
	}

	if len(versions) == 0 {
		return "", fmt.Errorf("no versions found")
	}

	return versions[0], nil
}
