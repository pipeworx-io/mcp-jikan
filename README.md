# mcp-jikan

MCP server for anime and manga data via the [Jikan API](https://jikan.moe/) (MyAnimeList). No authentication required.

## Tools

| Tool | Description |
|------|-------------|
| `search_anime` | Search anime by title |
| `get_anime` | Get full details for a specific anime by MAL ID |
| `top_anime` | Get top-ranked anime, optionally filtered by type |
| `search_characters` | Search anime/manga characters by name |

## Quickstart (Pipeworx Gateway)

```bash
curl -X POST https://gateway.pipeworx.io/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "jikan_search_anime",
      "arguments": { "query": "Fullmetal Alchemist" }
    },
    "id": 1
  }'
```

## License

MIT
