/**
 * Servidor MCP do pedagio (SPEC §8): cliente fino da API pública, sem acesso ao banco.
 * Cada ferramenta paga chama o endpoint correspondente via x402 (USDC na rede Base).
 *
 * Env:
 *   BRAZILAYER_API_URL      (default https://api.brazilayer.com)
 *   BRAZILAYER_PRIVATE_KEY  chave 0x... da carteira COMPRADORA (paga as chamadas).
 *                           Sem ela, só as ferramentas gratuitas funcionam.
 */
import { webcrypto } from 'node:crypto'
if (!globalThis.crypto) (globalThis as { crypto: Crypto }).crypto = webcrypto as Crypto

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { x402Client } from '@x402/core/client'
import { ExactEvmScheme } from '@x402/evm/exact/client'
import { wrapFetchWithPayment } from '@x402/fetch'
import { privateKeyToAccount } from 'viem/accounts'
import { z } from 'zod'

const API =
  process.env.BRAZILAYER_API_URL ?? process.env.PEDAGIO_API_URL ?? 'https://api.brazilayer.com'
const CHAVE = process.env.BRAZILAYER_PRIVATE_KEY ?? process.env.PEDAGIO_CHAVE_PRIVADA

let buscar: typeof fetch = fetch
if (CHAVE?.startsWith('0x')) {
  const conta = privateKeyToAccount(CHAVE as `0x${string}`)
  const cliente = new x402Client()
    .register('eip155:84532', new ExactEvmScheme(conta))
    .register('eip155:8453', new ExactEvmScheme(conta))
  buscar = wrapFetchWithPayment(fetch, cliente) as typeof fetch
}

async function chamar(caminho: string): Promise<{ content: { type: 'text'; text: string }[] }> {
  const res = await buscar(`${API}${caminho}`)
  const texto = await res.text()
  if (res.status === 402) {
    return {
      content: [
        {
          type: 'text',
          text:
            'HTTP 402: esta ferramenta é paga via x402 e o servidor MCP está sem carteira. ' +
            'Configure BRAZILAYER_PRIVATE_KEY com uma carteira com USDC na rede Base.',
        },
      ],
    }
  }
  return { content: [{ type: 'text', text: texto }] }
}

const servidor = new McpServer({ name: 'brazilayer', version: '0.2.0' })

servidor.registerTool(
  'cnpj_consultar_empresa',
  {
    title: 'Look up a Brazilian company by CNPJ',
    description:
      'Official registration data for a Brazilian company from the Receita Federal CNPJ registry: legal name, status, activities (CNAE), address, tax regime. Costs $0.005 in USDC via x402. Response keys are in Portuguese.',
    inputSchema: {
      cnpj: z.string().describe('CNPJ, 14 digits, with or without punctuation'),
    },
  },
  ({ cnpj }) => chamar(`/v1/cnpj/empresa/${encodeURIComponent(cnpj)}`),
)

servidor.registerTool(
  'cnpj_listar_socios',
  {
    title: 'List partners/shareholders of a Brazilian company',
    description:
      'Partners and shareholders (socios) of a Brazilian company, with role, masked tax id and entry date. Costs $0.005 in USDC via x402.',
    inputSchema: {
      cnpj: z.string().describe('CNPJ, 14 digits, with or without punctuation'),
    },
  },
  ({ cnpj }) => chamar(`/v1/cnpj/empresa/${encodeURIComponent(cnpj)}/socios`),
)

servidor.registerTool(
  'cnpj_consultar_empresa_completo',
  {
    title: 'Full Brazilian company profile (registration + partners + branches)',
    description:
      'Complete bundle in one call: registration data, all partners and all branches (filiais). Costs $0.01 in USDC via x402. Best value for a full profile.',
    inputSchema: {
      cnpj: z.string().describe('CNPJ, 14 digits, with or without punctuation'),
    },
  },
  ({ cnpj }) => chamar(`/v1/cnpj/empresa/${encodeURIComponent(cnpj)}/completo`),
)

servidor.registerTool(
  'cnpj_buscar_empresas',
  {
    title: 'Search Brazilian companies',
    description:
      'Search the CNPJ registry by name (full-text, accent-insensitive), state (uf), city code, CNAE activity or size. At least one filter required. Costs $0.01 in USDC via x402.',
    inputSchema: {
      nome: z.string().optional().describe('full-text search on company names'),
      uf: z.string().length(2).optional().describe('2-letter state code, e.g. SP'),
      municipio: z.string().optional().describe('4-digit RFB city code'),
      cnae: z.string().optional().describe('7-digit CNAE activity code'),
      porte: z.enum(['micro_empresa', 'pequeno_porte', 'demais', 'nao_informado']).optional(),
      situacao: z.enum(['ativa', 'baixada', 'suspensa', 'inapta', 'nula']).optional(),
      pagina: z.number().int().optional(),
      por_pagina: z.number().int().max(50).optional(),
    },
  },
  (filtros) => {
    const q = new URLSearchParams()
    for (const [chave, valor] of Object.entries(filtros)) {
      if (valor !== undefined) q.set(chave, String(valor))
    }
    return chamar(`/v1/cnpj/busca?${q}`)
  },
)

servidor.registerTool(
  'cnpj_buscar_por_socio',
  {
    title: 'Reverse lookup: companies by partner name',
    description:
      'Find every Brazilian company where a person or entity appears as partner/shareholder, by name. The due-diligence query. Costs $0.02 in USDC via x402.',
    inputSchema: {
      nome: z.string().min(3).describe('person or entity name'),
      pagina: z.number().int().optional(),
      por_pagina: z.number().int().max(50).optional(),
    },
  },
  ({ nome, pagina, por_pagina }) => {
    const q = new URLSearchParams({ nome })
    if (pagina) q.set('pagina', String(pagina))
    if (por_pagina) q.set('por_pagina', String(por_pagina))
    return chamar(`/v1/cnpj/socio/busca?${q}`)
  },
)

servidor.registerTool(
  'cnpj_obter_amostra',
  {
    title: 'Free sample response (no payment needed)',
    description:
      'Full sample company profile, free. Use it to learn the response format before paying for other tools.',
    inputSchema: {},
  },
  () => chamar('/v1/cnpj/amostra'),
)

servidor.registerTool(
  'integridade_consultar',
  {
    title: 'Sanctions & integrity screening for a Brazilian company',
    description:
      'Screen a CNPJ against official Brazilian government sanction lists in one call: CEIS (debarred), CNEP (anti-corruption fines), CEPIM, slave-labor blacklist and leniency agreements. Returns matches with details and a clean-record flag. Costs $0.01 in USDC via x402. Updated daily.',
    inputSchema: {
      cnpj: z.string().describe('CNPJ, 14 digits, with or without punctuation'),
    },
  },
  ({ cnpj }) => chamar(`/v1/integridade/consulta/${encodeURIComponent(cnpj)}`),
)

servidor.registerTool(
  'integridade_obter_amostra',
  {
    title: 'Free sample of the sanctions screening response',
    description:
      'Full sample screening response for a real sanctioned company, free. Use it to learn the format before paying.',
    inputSchema: {},
  },
  () => chamar('/v1/integridade/amostra'),
)

servidor.registerTool(
  'licitacoes_contratos_fornecedor',
  {
    title: 'Public contracts won by a Brazilian company',
    description:
      'Every government contract won by a company (CNPJ), from the official procurement portal (PNCP): body, object, value, dates, plus summary totals. The B2G piece of due diligence. Costs $0.01 in USDC via x402.',
    inputSchema: {
      cnpj: z.string().describe('CNPJ, 14 digits, with or without punctuation'),
    },
  },
  ({ cnpj }) => chamar(`/v1/licitacoes/fornecedor/${encodeURIComponent(cnpj)}`),
)

servidor.registerTool(
  'licitacoes_oportunidades_abertas',
  {
    title: 'Open Brazilian government tenders (live)',
    description:
      'Tenders currently accepting proposals, live from the official source: object, estimated value, deadlines, bidding link. Filter by state and modality. Costs $0.01 in USDC via x402.',
    inputSchema: {
      uf: z.string().length(2).optional().describe('2-letter state code'),
      modalidade: z.string().optional().describe('PNCP modality code, default 6 (electronic auction)'),
      pagina: z.number().int().optional(),
      por_pagina: z.number().int().max(50).optional(),
    },
  },
  (f) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(f)) if (v !== undefined) q.set(k, String(v))
    return chamar(`/v1/licitacoes/abertas?${q}`)
  },
)

servidor.registerTool(
  'licitacoes_obter_amostra',
  {
    title: 'Free sample of the public-contracts response',
    description: 'Full sample supplier-contracts response, free. Learn the format before paying.',
    inputSchema: {},
  },
  () => chamar('/v1/licitacoes/amostra'),
)

servidor.registerTool(
  'bcb_verificar_instituicao',
  {
    title: 'Central Bank of Brazil authorization check',
    description:
      'Is this Brazilian company a Central Bank–authorized financial institution (bank, credit union, consortium)? Returns registrations and officially verified internet domains (anti-phishing). Costs $0.005 in USDC via x402. Updated daily.',
    inputSchema: {
      cnpj: z.string().describe('CNPJ (14 digits) or 8-digit root, punctuation ok'),
    },
  },
  ({ cnpj }) => chamar(`/v1/bcb/instituicao/${encodeURIComponent(cnpj)}`),
)

servidor.registerTool(
  'bcb_obter_amostra',
  {
    title: 'Free sample of the Central Bank check response',
    description: 'Sample response for a real authorized bank, free.',
    inputSchema: {},
  },
  () => chamar('/v1/bcb/amostra'),
)

const transporte = new StdioServerTransport()
await servidor.connect(transporte)
console.error(`pedagio-mcp pronto (API: ${API}; pagamentos ${CHAVE ? 'ATIVOS' : 'inativos'})`)
