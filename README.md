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
| `licitacoes_contratos_fornecedor` | Public contracts won by a company (PNCP) | $0.01 |
| `licitacoes_oportunidades_abertas` | Open government tenders, live | $0.01 |
| `bcb_verificar_instituicao` | Central Bank authorization + verified domains | $0.005 |
| `empresa_enriquecer` | Full KYB profile in ONE call: registration + partners + sanctions + BCB + contracts | $0.05 |
| `mercado_noticias` | BR financial & crypto news with AI sentiment, 15-min refresh | $0.002 |
| `mercado_indicadores` | Selic, IPCA, PTAX + Focus survey medians (Central Bank) | $0.002 |
| `mercado_cambio` | Official PTAX + live BRL crypto premium (capital-flow signal) | $0.002 |
| `commodities_clima` | Crop-weather stress per Brazilian belt: rain, drought, frost risk | $0.005 |
| `commodities_fogo` | Satellite fire hotspots by biome + drought proxy (INPE) | $0.002 |
| `commodities_exportacoes` | Monthly commodity exports with YoY (soy, coffee, sugar, beef…) | $0.005 |
| `commodities_hidrologia` | Stored hydro energy by grid subsystem (ONS) | $0.002 |
| `commodities_briefing` | Daily AI Brazil Commodity Briefing in English, with direction flags | $0.10 |
| `fundos_fluxos` | Daily net flows of Brazilian institutional money by fund class (R$ 13.8tn) | $0.005 |
| `fundos_verificar` | Verify a fund at the CVM: registered, operating, manager (anti-fraud) | $0.005 |
| `fundos_ranking` | Rank/screen ~25,000 fund classes by assets, inflows or shareholders | $0.01 |
| `tributos_ncm` | Which IBS/CBS regime applies to a product (NCM), with legal basis | $0.005 |
| `tributos_busca` | Search the tax-reform annexes by product description | $0.005 |
| `tributos_calendario` | Brazilian tax transition calendar 2026-2033 | $0.002 |
| `cadeia_causal` | Causal chain with lead time: energy, coffee, soy, capital flows | $0.05 |
| `desmatamento_municipio` | Deforestation of a municipality since the EUDR cutoff (INPE) | $0.01 |
| `desmatamento_fornecedor` | Supplier CNPJ → deforestation record of its municipality | $0.02 |
| `desmatamento_ranking` | Where clearing is concentrated, by municipality or state | $0.01 |
| `cnpj_obter_amostra` | Sample company response | free |
| `integridade_obter_amostra` | Sample screening response | free |
| `licitacoes_obter_amostra` | Sample public-contracts response | free |
| `bcb_obter_amostra` | Sample Central Bank check | free |
| `mercado_obter_amostra` | Sample Brazil Markets response (news + indicators) | free |
| `commodities_obter_amostra` | Sample Commodity Signals response | free |
| `fundos_obter_amostra` | Sample Fund Industry response | free |
| `tributos_obter_amostra` | Sample Tax Reform response | free |
| `cadeia_obter_amostra` | Sample causal chain | free |
| `desmatamento_obter_amostra` | Sample deforestation response | free |

Prices are paid in USDC on Base, per request, by the wallet you configure. The three
free sample tools work without any wallet.

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
