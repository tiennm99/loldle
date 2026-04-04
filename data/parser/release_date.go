package parser

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// EnrichReleaseDates fetches the LoL Wiki to add release year to each champion.
func EnrichReleaseDates(champions []ChampionResult) ([]ChampionResult, error) {
	doc, err := fetchWikiDoc("List_of_champions")
	if err != nil {
		return nil, fmt.Errorf("fetching wiki champion list: %w", err)
	}

	// Build a name-to-index map for O(1) lookups.
	nameIndex := buildNameIndex(champions)

	// The first <tbody> contains the champion list table.
	doc.Find("tbody").First().Find("tr").Each(func(_ int, row *goquery.Selection) {
		cols := row.Find("td")
		if cols.Length() == 0 {
			return
		}

		name := strings.TrimSpace(cols.Eq(1).Find("a").AttrOr("title", ""))
		name = strings.ReplaceAll(name, "/LoL", "")

		dateText := strings.TrimSpace(cols.Eq(3).Text())
		parts := strings.Split(dateText, "-")
		yearStr := parts[len(parts)-1]

		year, err := strconv.Atoi(yearStr)
		if err != nil {
			return
		}

		if idx, ok := nameIndex[name]; ok {
			champions[idx].ReleaseDate = year
		}
	})

	return champions, nil
}
