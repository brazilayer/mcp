# pedagio-mcp: servidor MCP

> **Distribuição pública:** este servidor é publicado em **[github.com/brazilayer/mcp](https://github.com/brazilayer/mcp)**
> (instalação para usuários finais lá). Esta pasta é a fonte interna; alterações aqui
> devem ser espelhadas no repo público.

Cliente fino da API pública do pedagio (SPEC §8): expõe os dados de CNPJ como
ferramentas MCP pagáveis via x402. Sem acesso direto ao banco: cada ferramenta chama a
API HTTP e paga com USDC (rede Base) usando a carteira configurada.

## Ferramentas

| Ferramenta | Endpoint | Preço |
|------------|----------|-------|
| `cnpj_consultar_empresa` | `GET /v1/cnpj/empresa/{cnpj}` | US$ 0.005 |
| `cnpj_listar_socios` | `GET /v1/cnpj/empresa/{cnpj}/socios` | US$ 0.005 |
| `cnpj_consultar_empresa_completo` | `GET /v1/cnpj/empresa/{cnpj}/completo` | US$ 0.01 |
| `cnpj_buscar_empresas` | `GET /v1/cnpj/busca` | US$ 0.01 |
| `cnpj_buscar_por_socio` | `GET /v1/cnpj/socio/busca` | US$ 0.02 |
| `cnpj_obter_amostra` | `GET /v1/cnpj/amostra` | grátis |
| `trust_check` | Trust rating of any x402 service before paying it (Agent Economy Report, free) | free |
| `skill_check` | Trust rating of any agent skill before installing it (Agent Economy Report, free) | free |
| `conduct_check` | Conduct rating of any AI agent or framework before delegating to it (Agent Economy Report arena, free) | free |

## Instalação (Claude Code)

```bash
git clone https://github.com/aladaf/pedagio && cd pedagio/mcp && npm install
claude mcp add pedagio -e BRAZILAYER_PRIVATE_KEY=0xSUACHAVE -- npx tsx /caminho/para/pedagio/mcp/servidor.ts
```

## Instalação (Claude Desktop / Cursor)

```json
{
  "mcpServers": {
    "pedagio": {
      "command": "npx",
      "args": ["tsx", "/caminho/para/pedagio/mcp/servidor.ts"],
      "env": {
        "BRAZILAYER_PRIVATE_KEY": "0xCHAVE_DA_CARTEIRA_QUE_PAGA"
      }
    }
  }
}
```

## Variáveis

- `BRAZILAYER_API_URL`: default `https://api.brazilayer.com`
- `BRAZILAYER_PRIVATE_KEY`: chave privada (0x…) da carteira que **paga** as chamadas
  (precisa de USDC na rede Base; na testnet, USDC de faucet na Base Sepolia). Sem ela,
  apenas `cnpj_obter_amostra` funciona; as demais explicam o 402.

⚠️ A chave configurada aqui assina pagamentos reais. Use uma carteira dedicada com
saldo pequeno.

## Escolha da integração x402↔MCP (SPEC §8)

Avaliado em 2026-07-20: adotados os pacotes oficiais `@x402/fetch` + `@x402/evm`
(v2.19), que envelopam o `fetch` com o fluxo 402→assinatura→retry, e o servidor MCP usa
esse fetch pagante em cada ferramenta. Alternativas de bridge MCP de terceiros foram
descartadas por serem menos mantidas que o SDK oficial.

---

Building on the agent economy? We publish the
**[Agent Economy Report](https://agenteconomy.report)**, a free weekly, data-generated
index of the machine-to-machine economy (x402 services, on-chain settlement, MCP and
paid-web adoption). One e-mail a week.
