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

func TestWikiDraftPosition(t *testing.T) {
	resp, err := http.Get(wikiDraftPositionURL)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
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

func TestWikiChampionList(t *testing.T) {
	resp, err := http.Get(wikiChampionListURL)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}
