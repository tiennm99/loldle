package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sort"

	"github.com/tiennm99/loldle-data/parser"
)

func main() {
	champions, err := parser.ParseChampions(championsVersion)
	if err != nil {
		log.Fatalf("Failed to parse champions: %v", err)
	}

	champions, err = parser.EnrichReleaseDates(champions)
	if err != nil {
		log.Fatalf("Failed to enrich release dates: %v", err)
	}

	champions, err = parser.EnrichRegions(champions)
	if err != nil {
		log.Fatalf("Failed to enrich regions: %v", err)
	}

	champions, err = parser.EnrichLanes(champions)
	if err != nil {
		log.Fatalf("Failed to enrich lanes: %v", err)
	}

	sort.Slice(champions, func(i, j int) bool {
		return champions[i].Name < champions[j].Name
	})

	outputPath := "champions.json"
	if err := saveJSON(outputPath, champions); err != nil {
		log.Fatalf("Failed to save JSON: %v", err)
	}

	fmt.Printf("Champion data has been saved to %s\n", outputPath)
}

func saveJSON(path string, data []parser.ChampionResult) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetEscapeHTML(false)
	encoder.SetIndent("", "    ")
	return encoder.Encode(data)
}
