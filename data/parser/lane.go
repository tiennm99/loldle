package parser

import (
	"fmt"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// columnLaneMap maps 1-indexed column positions to lane names.
var columnLaneMap = map[int]string{
	1: "top",
	2: "jungle",
	3: "mid",
	4: "bottom",
	5: "support",
}

// EnrichLanes fetches the LoL Wiki draft position table to add lane data.
func EnrichLanes(champions []ChampionResult) ([]ChampionResult, error) {
	doc, err := fetchWikiDoc("List_of_champions_by_draft_position")
	if err != nil {
		return nil, fmt.Errorf("fetching wiki draft positions: %w", err)
	}

	nameIndex := buildNameIndex(champions)

	// The second <tbody> contains the draft position table.
	doc.Find("tbody").Eq(1).Find("tr").Each(func(_ int, row *goquery.Selection) {
		cols := row.Find("td")
		if cols.Length() == 0 {
			return
		}

		cols.Each(func(colIdx int, col *goquery.Selection) {
			// Check if this column has a lane indicator image (alt="Yes" or alt="Official").
			hasIndicator := col.Find("img[alt='Yes'], img[alt='Official']").Length() > 0
			if !hasIndicator {
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
