package parser

import (
	"fmt"
	"net/http"
	"testing"
)

const testVersion = "16.2.1"

func TestDdragonAPI(t *testing.T) {
	url := fmt.Sprintf("https://ddragon.leagueoflegends.com/cdn/%s/data/en_US/championFull.json", testVersion)
	resp, err := http.Get(url)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}

func TestWikiAPIChampionList(t *testing.T) {
	doc, err := fetchWikiDoc("List_of_champions")
	if err != nil {
		t.Fatalf("fetch failed: %v", err)
	}
	if doc.Find("tbody").Length() == 0 {
		t.Fatal("expected at least one tbody in champion list")
	}
}

func TestWikiAPIDraftPosition(t *testing.T) {
	doc, err := fetchWikiDoc("List_of_champions_by_draft_position")
	if err != nil {
		t.Fatalf("fetch failed: %v", err)
	}
	if doc.Find("tbody").Length() < 2 {
		t.Fatal("expected at least two tbody in draft position page")
	}
}

func TestRegionAPI(t *testing.T) {
	url := "https://universe-meeps.leagueoflegends.com/v1/en_us/factions/bilgewater/index.json"
	resp, err := http.Get(url)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	ct := resp.Header.Get("Content-Type")
	if ct != "application/json" {
		t.Fatalf("expected application/json, got %s", ct)
	}
}
