package parser

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

var regions = []string{
	"bandle-city", "bilgewater", "demacia", "ionia", "ixtal", "noxus",
	"piltover", "shadow-isles", "shurima", "mount-targon", "freljord", "void", "zaun",
}

// factionResponse represents the Universe API faction endpoint response.
type factionResponse struct {
	AssociatedChampions []struct {
		Name string `json:"name"`
	} `json:"associated-champions"`
}

// EnrichRegions fetches faction affiliations and adds region data to each champion.
func EnrichRegions(champions []ChampionResult) ([]ChampionResult, error) {
	nameIndex := buildNameIndex(champions)

	for _, faction := range regions {
		url := fmt.Sprintf("https://universe-meeps.leagueoflegends.com/v1/en_us/factions/%s/index.json", faction)
		resp, err := http.Get(url)
		if err != nil {
			fmt.Printf("Can't load data for faction %s: %v\n", faction, err)
			continue
		}

		var fResp factionResponse
		if err := json.NewDecoder(resp.Body).Decode(&fResp); err != nil {
			resp.Body.Close()
			fmt.Printf("Can't parse data for faction %s: %v\n", faction, err)
			continue
		}
		resp.Body.Close()

		for _, assoc := range fResp.AssociatedChampions {
			// Normalize Unicode apostrophe to ASCII.
			champName := strings.ReplaceAll(assoc.Name, "\u2019", "'")
			if idx, ok := nameIndex[champName]; ok {
				if champions[idx].Region == "" {
					champions[idx].Region = faction
				} else {
					champions[idx].Region += "," + faction
				}
			}
		}
	}

	// Default to "runeterra" for champions with no faction.
	for i := range champions {
		if champions[i].Region == "" {
			champions[i].Region = "runeterra"
		}
	}

	return champions, nil
}
