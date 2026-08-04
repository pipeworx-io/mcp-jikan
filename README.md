# mcp-jikan

Jikan MCP — wraps the Jikan v4 API (anime/manga data, free, no auth)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_anime` | Search for anime by title. Returns title, score, type, episode count, status, synopsis, and genres. |
| `get_anime` | Get full details for an anime by ID. Returns score, synopsis, genres, studios, episode count, and more. |
| `top_anime` | Get top-ranked anime, optionally filtered by type (e.g., "tv", "movie", "ova", "ona"). Returns titles, scores, and rankings. |
| `search_characters` | Search for anime/manga characters by name. Returns character names, nicknames, favorites count, and biography. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "jikan": {
      "url": "https://gateway.pipeworx.io/jikan/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Jikan data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
