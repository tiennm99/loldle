package parser

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// wikiAPIResponse represents the MediaWiki parse API response.
type wikiAPIResponse struct {
	Parse struct {
		Text struct {
			Content string `json:"*"`
		} `json:"text"`
	} `json:"parse"`
}

// fetchWikiDoc fetches a Fandom wiki page via the MediaWiki parse API (bypasses Cloudflare)
// and returns a goquery document of the rendered HTML.
func fetchWikiDoc(pageName string) (*goquery.Document, error) {
	url := fmt.Sprintf(
		"https://leagueoflegends.fandom.com/api.php?action=parse&page=%s&prop=text&format=json",
		pageName,
	)
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("fetching wiki API for %s: %w", pageName, err)
	}
	defer resp.Body.Close()

	var apiResp wikiAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, fmt.Errorf("decoding wiki API response: %w", err)
	}

	return goquery.NewDocumentFromReader(strings.NewReader(apiResp.Parse.Text.Content))
}

// buildNameIndex creates a map from champion name to slice index for O(1) lookups.
func buildNameIndex(champions []ChampionResult) map[string]int {
	idx := make(map[string]int, len(champions))
	for i, c := range champions {
		idx[c.Name] = i
	}
	return idx
}
