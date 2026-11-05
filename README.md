# Brazilayer MCP server

Official Brazilian public data for AI agents, paid per call in USDC on Base through the
[x402 protocol](https://www.x402.org/). No account and no API key: the server pays each call
from a wallet you configure, and the free tools work without one.

- API reference and prices: <https://api.brazilayer.com/docs>
- Website: <https://www.brazilayer.com>
- Listed in the [MCP Registry](https://registry.modelcontextprotocol.io) as
  `io.github.brazilayer/mcp`, and on [PayAPI Market](https://payapi.market/api/brazilayer)

## Tools

| Family | Tools | What they return |
|---|---|---|
| Company registry (CNPJ) | `cnpj_situacao`, `cnpj_consultar_empresa`, `cnpj_listar_socios`, `cnpj_consultar_empresa_completo`, `cnpj_buscar_empresas`, `cnpj_buscar_por_socio` | Receita Federal registry: status, activities, address, partners, branches; search by name, place, activity or partner |
| Sanctions | `integridade_consultar` | CEIS, CNEP, CEPIM, the slave-labour list and leniency agreements, in one call |
| Government contracts | `licitacoes_contratos_fornecedor`, `licitacoes_oportunidades_abertas` | Contracts won by a company and tenders open now, from the national procurement portal (PNCP) |
| Central Bank | `bcb_verificar_instituicao` | Whether a company is an authorized financial institution, with its verified domains |
| Enrichment | `empresa_enriquecer` | Registry, partners, branches, sanctions, Central Bank and contracts in one call |
| Market | `mercado_noticias`, `mercado_indicadores`, `mercado_cambio`, `mercado_pacote` | News with sentiment every 15 minutes; Selic, IPCA, PTAX and Focus; the BRL crypto premium |
| Commodities | `commodities_clima`, `commodities_fogo`, `commodities_exportacoes`, `commodities_hidrologia`, `commodities_briefing`, `commodities_pacote` | Rain and frost risk in the crop belts, fire hotspots, exports, reservoirs and a daily briefing |
| Investment funds (CVM) | `fundos_fluxos`, `fundos_verificar`, `fundos_ranking`, `fundos_carteira`, `fundos_movimentacoes` | Daily flows by class, fund registration, rankings, holdings and institutional flow per stock |
| Tax reform | `tributos_ncm`, `tributos_busca`, `tributos_calendario` | IBS/CBS treatment by NCM code, reduced and zero rates, the transition calendar |
| Deforestation (EUDR) | `desmatamento_municipio`, `desmatamento_fornecedor`, `desmatamento_ranking` | INPE DETER alerts by municipality, exposure of a supplier, rankings |
| Causal chains | `cadeia_causal` | An upstream indicator with its lead time, the current state and a reading |
| Bundle | `brasil_pacote` | The 13 endpoints that need no parameter, in one call |
| Free samples | `*_obter_amostra` (one per family) | The response format of each family, without payment |
| Trust checks (free) | `trust_check`, `skill_check` | The public ratings of the [Agent Economy Report](https://agenteconomy.report) for an x402 service or an agent skill, before you pay or install |

## Install

**Claude Desktop.** Download `brazilayer-mcp.mcpb` from the
[latest release](https://github.com/brazilayer/mcp/releases/latest) and open it. The installer
asks for the wallet key, which is optional.

**Claude Code**, from source:

```bash
git clone https://github.com/brazilayer/mcp && cd mcp && npm install
claude mcp add brazilayer -e BRAZILAYER_PRIVATE_KEY=0xYOUR_KEY -- npx tsx "$PWD/servidor.ts"
```

**Other MCP clients** (Cursor and others), after the same `git clone` and `npm install`:

```json
{
  "mcpServers": {
    "brazilayer": {
      "command": "npx",
      "args": ["tsx", "/path/to/mcp/servidor.ts"],
      "env": { "BRAZILAYER_PRIVATE_KEY": "0xYOUR_KEY" }
    }
  }
}
```

## Configuration

- `BRAZILAYER_PRIVATE_KEY` (optional): private key (0x…) of the wallet that pays for calls. It
  needs USDC on Base. Without it the free tools work, and the paid ones explain the 402 they
  received.
- `BRAZILAYER_API_URL` (optional): defaults to `https://api.brazilayer.com`.

The key signs real payments. Use a dedicated wallet with a small balance.

## License

MIT
