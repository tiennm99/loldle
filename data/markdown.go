package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/tiennm99/loldle/data/parser"
)

// saveMarkdown renders champions as a human-readable table matching the
// Loldle classic-mode column order: Champion | Gender | Genre | Range |
// Resource | Region | Lane | Year.
func saveMarkdown(path string, champions []parser.ChampionResult) error {
	var b strings.Builder

	fmt.Fprintln(&b, "# Champions")
	fmt.Fprintln(&b)
	fmt.Fprintf(&b, "Auto-generated from [`champions.json`](./champions.json). Total: **%d** champions.\n", len(champions))
	fmt.Fprintln(&b)
	fmt.Fprintln(&b, "Columns match Loldle classic mode: Champion | Gender | Genre (class) | Range | Resource | Region | Lane | Year.")
	fmt.Fprintln(&b)
	fmt.Fprintln(&b, "| | Champion | Gender | Genre | Range | Resource | Region | Lane | Year |")
	fmt.Fprintln(&b, "|---|---|---|---|---|---|---|---|---|")

	for _, c := range champions {
		year := "—"
		if c.ReleaseDate != 0 {
			year = fmt.Sprintf("%d", c.ReleaseDate)
		}
		fmt.Fprintf(&b,
			"| %s | **%s**<br/><sub>%s</sub> | %s | %s | %s | %s | %s | %s | %s |\n",
			tileIcon(c.ID, c.Name),
			c.Name,
			c.Title,
			formatGender(c.Gender),
			formatMulti(c.Genre),
			formatRange(c.AttackType),
			orDash(c.Resource),
			formatRegion(c.Region),
			formatMulti(c.Lane),
			year,
		)
	}

	return os.WriteFile(path, []byte(b.String()), 0o644)
}

func tileIcon(id, alt string) string {
	return fmt.Sprintf(
		`<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/%s_0.jpg" width="32" height="32" alt="%s"/>`,
		id, alt,
	)
}

func formatGender(v string) string { return orDash(capitalize(v)) }

func formatRange(v string) string {
	switch v {
	case "close":
		return "Melee"
	case "range":
		return "Ranged"
	default:
		return "—"
	}
}

// formatMulti splits comma-separated values, trims, capitalizes each, rejoins with ", ".
func formatMulti(v string) string {
	if v == "" {
		return "—"
	}
	parts := strings.Split(v, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		out = append(out, capitalize(p))
	}
	if len(out) == 0 {
		return "—"
	}
	return strings.Join(out, ", ")
}

// formatRegion splits dash-separated regions (e.g. "shadow-isles") and title-cases each.
func formatRegion(v string) string {
	if v == "" {
		return "—"
	}
	parts := strings.Split(v, "-")
	for i, p := range parts {
		parts[i] = capitalize(p)
	}
	return strings.Join(parts, " ")
}

func capitalize(s string) string {
	if s == "" {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

func orDash(s string) string {
	if s == "" {
		return "—"
	}
	return s
}
