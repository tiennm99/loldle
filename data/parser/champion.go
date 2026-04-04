package parser

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// ddragonResponse represents the top-level ddragon championFull.json response.
type ddragonResponse struct {
	Data map[string]ddragonChampion `json:"data"`
}

type ddragonChampion struct {
	ID      string            `json:"id"`
	Name    string            `json:"name"`
	Title   string            `json:"title"`
	Partype string            `json:"partype"`
	Tags    []string          `json:"tags"`
	Skins   []json.RawMessage `json:"skins"`
	Image   ChampionImage     `json:"image"`
	Stats   struct {
		AttackRange float64 `json:"attackrange"`
	} `json:"stats"`
}

// ChampionImage holds sprite sheet metadata with fields ordered to match the expected output.
type ChampionImage struct {
	Full   string `json:"full"`
	Sprite string `json:"sprite"`
	Group  string `json:"group"`
	X      int    `json:"x"`
	Y      int    `json:"y"`
	W      int    `json:"w"`
	H      int    `json:"h"`
}

// ChampionResult holds the enriched data for a single champion.
type ChampionResult struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Title       string        `json:"title"`
	Resource    string        `json:"resource"`
	Genre       string        `json:"genre"`
	SkinCount   int           `json:"skinCount"`
	Image       ChampionImage `json:"image"`
	Gender      string        `json:"gender"`
	AttackType  string        `json:"attackType"`
	ReleaseDate int           `json:"releaseDate,omitempty"`
	Region      string        `json:"region,omitempty"`
	Lane        string        `json:"lane,omitempty"`
}

// ParseChampions fetches base champion data from ddragon and detects gender concurrently.
func ParseChampions(version string) ([]ChampionResult, error) {
	url := fmt.Sprintf("https://ddragon.leagueoflegends.com/cdn/%s/data/en_US/championFull.json", version)
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("fetching ddragon: %w", err)
	}
	defer resp.Body.Close()

	var ddResp ddragonResponse
	if err := json.NewDecoder(resp.Body).Decode(&ddResp); err != nil {
		return nil, fmt.Errorf("decoding ddragon: %w", err)
	}

	// Fetch gender concurrently for all champions.
	genderMap := make(map[string]string, len(ddResp.Data))
	var mu sync.Mutex
	var wg sync.WaitGroup
	sem := make(chan struct{}, 10) // limit to 10 concurrent requests

	for id := range ddResp.Data {
		wg.Add(1)
		go func(champID string) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			gender := detectGender(champID)
			mu.Lock()
			genderMap[champID] = gender
			mu.Unlock()
		}(id)
	}
	wg.Wait()

	// Map data to result slice.
	results := make([]ChampionResult, 0, len(ddResp.Data))
	for _, champ := range ddResp.Data {
		attackType := "range"
		if champ.Stats.AttackRange < 500 {
			attackType = "close"
		}

		results = append(results, ChampionResult{
			ID:         champ.ID,
			Name:       champ.Name,
			Title:      champ.Title,
			Resource:   champ.Partype,
			Genre:      strings.Join(champ.Tags, ","),
			SkinCount:  len(champ.Skins),
			Image:      champ.Image,
			Gender:     genderMap[champ.ID],
			AttackType: attackType,
		})
		fmt.Printf("Data fetched for %s\n", champ.Name)
	}

	return results, nil
}

// universeChampionResponse represents the biography response from the Universe API.
type universeChampionResponse struct {
	Champion struct {
		Biography struct {
			Full string `json:"full"`
		} `json:"biography"`
	} `json:"champion"`
}

// detectGender infers champion gender from biography pronoun frequency.
func detectGender(championID string) string {
	// Special case: Renata's URL slug differs from her ID.
	urlID := strings.ToLower(championID)
	if urlID == "renata" {
		urlID = "renataglasc"
	}

	url := fmt.Sprintf("https://universe-meeps.leagueoflegends.com/v1/en_us/champions/%s/index.json", urlID)
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return "divers"
	}
	defer resp.Body.Close()

	var ucResp universeChampionResponse
	if err := json.NewDecoder(resp.Body).Decode(&ucResp); err != nil {
		return "divers"
	}

	words := strings.Fields(strings.ToLower(ucResp.Champion.Biography.Full))
	maleKeywords := map[string]bool{"he": true, "him": true, "his": true}
	femaleKeywords := map[string]bool{"she": true, "her": true, "hers": true}

	var maleCount, femaleCount int
	for _, w := range words {
		if maleKeywords[w] {
			maleCount++
		}
		if femaleKeywords[w] {
			femaleCount++
		}
	}

	switch {
	case maleCount > femaleCount:
		return "male"
	case femaleCount > maleCount:
		return "female"
	default:
		return "divers"
	}
}
