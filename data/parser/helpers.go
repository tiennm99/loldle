package parser

// buildNameIndex creates a map from champion name to slice index for O(1) lookups.
func buildNameIndex(champions []ChampionResult) map[string]int {
	idx := make(map[string]int, len(champions))
	for i, c := range champions {
		idx[c.Name] = i
	}
	return idx
}
