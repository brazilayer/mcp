# Brazilayer MCP Server

Give your AI agent access to **Brazilian public data** — the full company registry and
every official sanction list — as MCP tools, paid per call with USDC via the
[x402 protocol](https://www.x402.org/). No signup, no API keys.

Data comes straight from official government sources (Receita Federal company
registry, CGU/MTE sanction lists), redistributed as published. Service:
[www.brazilayer.com](https://www.brazilayer.com) · API docs:
[api.brazilayer.com/docs](https://api.brazilayer.com/docs)

## Tools

| Tool | What it does | Price |
|------|--------------|-------|
| `cnpj_consultar_empresa` | Company registration card by CNPJ | $0.005 |
| `cnpj_listar_socios` | Partners/shareholders of a company | $0.005 |
| `cnpj_consultar_empresa_completo` | Full profile: registration + partners + branches | $0.01 |
| `cnpj_buscar_empresas` | Search companies by name, state, city or activity | $0.01 |
| `cnpj_buscar_por_socio` | Reverse lookup: companies where a person is partner | $0.02 |
| `integridade_consultar` | Sanctions screening: 5 official lists in one call | $0.01 |
| `cnpj_obter_amostra` | Sample company response | free |
| `integridade_obter_amostra` | Sample screening response | free |

Prices are paid in USDC on Base, per request, by the wallet you configure. The two
free tools work without any wallet.

## Install

**One-click (Claude Desktop):** download `brazilayer-mcp.mcpb` from the
[latest release](https://github.com/brazilayer/mcp/releases/latest) and open it —
Claude Desktop installs the server and prompts for your wallet key (optional).

**From source:**

```bash
git clone https://github.com/brazilayer/mcp brazilayer-mcp
cd brazilayer-mcp && npm install
```

**Claude Code:**

```bash
claude mcp add brazilayer -e BRAZILAYER_PRIVATE_KEY=0xYOUR_KEY -- npx tsx /path/to/brazilayer-mcp/servidor.ts
```

**Claude Desktop / Cursor** (`mcpServers` config):

```json
{
  "mcpServers": {
    "brazilayer": {
      "command": "npx",
      "args": ["tsx", "/path/to/brazilayer-mcp/servidor.ts"],
      "env": { "BRAZILAYER_PRIVATE_KEY": "0xYOUR_KEY" }
    }
  }
}
```

## Configuration

| Variable | Purpose |
|----------|---------|
| `BRAZILAYER_PRIVATE_KEY` | Private key (`0x…`) of the wallet that **pays** for calls. Needs USDC on Base. Without it, only the free sample tools work. |
| `BRAZILAYER_API_URL` | API base URL. Default: `https://api.brazilayer.com` |

⚠️ **Wallet safety:** the key you configure signs real payments. Use a dedicated
wallet holding only a small budget (a few dollars covers hundreds of calls), never
your main wallet.

## How payment works

Each paid tool calls the Brazilayer API. The server replies `HTTP 402` with the price
and payment terms; this MCP server signs a USDC authorization (EIP-3009, gasless for
you) and retries automatically. One tool call ≈ two seconds, end to end. The service
is also listed on the [x402 Bazaar](https://docs.cdp.coinbase.com/x402/bazaar) for
autonomous discovery.

## Contact

contato@brazilayer.com · [Terms & data policy](https://api.brazilayer.com/termos)

Also on the [official MCP Registry](https://registry.modelcontextprotocol.io) as `io.github.brazilayer/mcp`.
