package parser

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

const wikiDraftPositionURL = "https://leagueoflegends.fandom.com/wiki/List_of_champions_by_draft_position"

// columnLaneMap maps 1-indexed column positions to lane names.
var columnLaneMap = map[int]string{
	1: "top",
	2: "jungle",
	3: "mid",
	4: "bottom",
	5: "support",
}

// EnrichLanes scrapes the LoL Wiki draft position table to add lane data.
func EnrichLanes(champions []ChampionResult) ([]ChampionResult, error) {
	resp, err := http.Get(wikiDraftPositionURL)
	if err != nil {
		return nil, fmt.Errorf("fetching wiki draft positions: %w", err)
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("parsing wiki HTML: %w", err)
	}

	nameIndex := buildNameIndex(champions)

	// The second <tbody> contains the draft position table.
	doc.Find("tbody").Eq(1).Find("tr").Each(func(_ int, row *goquery.Selection) {
		cols := row.Find("td")
		if cols.Length() == 0 {
			return
		}

		cols.Each(func(colIdx int, col *goquery.Selection) {
			// Check if this column has a "Yes" indicator image.
			if col.Find("img[alt='Yes']").Length() == 0 {
				return
			}

			// colIdx is 0-indexed; lane map uses the offset from the name column.
			lane, ok := columnLaneMap[colIdx]
			if !ok {
				return
			}

			name := strings.TrimSpace(cols.First().Find("a").AttrOr("title", ""))
			name = strings.ReplaceAll(name, "/LoL", "")

			if idx, found := nameIndex[name]; found {
				if champions[idx].Lane == "" {
					champions[idx].Lane = lane
				} else {
					champions[idx].Lane += "," + lane
				}
			}
		})
	})

	return champions, nil
}
