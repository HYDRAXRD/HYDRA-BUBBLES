# Lessons Learned

## 2026-03-06 - Pedido de acao imediata

- Quando o usuario pedir para corrigir e deployar, executar a correcao no repo e rodar deploy real antes de responder com orientacoes.
- Em problemas de deploy com Wrangler + Vite 5, priorizar `wrangler.jsonc` + comando com `--config` para evitar auto-setup que tenta instalar `@cloudflare/vite-plugin`.
