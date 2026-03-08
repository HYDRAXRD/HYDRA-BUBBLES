# Plano de correcao - build/deploy Cloudflare

- [x] Reproduzir o erro de deploy localmente e validar a causa raiz.
- [x] Aplicar configuracao do Wrangler para evitar auto-setup com plugin Vite incompativel.
- [x] Corrigir o aviso de CSS (`@import` fora da ordem) para deixar o build limpo.
- [x] Executar verificacoes (`bun run build` e validacao do `wrangler deploy` sem setup interativo).

## Review

- [x] Registrar resultados finais e evidencias de validacao.

- Causa raiz confirmada: `npx wrangler deploy` sem `wrangler.jsonc` tenta auto-configurar projeto Vite e injeta `@cloudflare/vite-plugin`, que exige `vite ^6.1.0 || ^7.0.0`, conflitando com `vite ^5.4.19`.
- Correcao aplicada: `wrangler.jsonc` adicionado com `assets.directory = ./dist` e SPA fallback, evitando o wizard de setup no deploy nao-interativo.
- Build validado sem erro de CSS apos mover `@import` para o topo de `src/index.css`.
- Validacao final local: `npm run build` concluido e `npx wrangler deploy --dry-run` executado sem tentativa de instalar `@cloudflare/vite-plugin`.

## Plano - rota /bubbles no dominio

- [x] Adicionar proxy `/bubbles` no Worker de `router` com strip de prefixo para o upstream do projeto bubbles.
- [x] Ajustar `HYDRA-BUBBLES` para subpath (`base` do Vite e `basename` do React Router).
- [x] Corrigir navegacao da pagina 404 para manter usuarios dentro de `/bubbles`.
- [x] Validar build do bubbles e dry-run do router antes de concluir.

## Review - rota /bubbles no dominio

- [x] Registrar evidencias finais de validacao e resultado funcional.

- Router atualizado com branch `/bubbles` em `router/src/index.js`, encaminhando para `hydrabubbles.hydrxrd.workers.dev` com strip do prefixo.
- Bubbles ajustado para subpath: `base: "/bubbles/"` em `HYDRA-BUBBLES/vite.config.ts` e `BrowserRouter basename="/bubbles"` em `HYDRA-BUBBLES/src/App.tsx`.
- Navegacao 404 corrigida com `Link to="/"` em `HYDRA-BUBBLES/src/pages/NotFound.tsx`, evitando sair do prefixo.
- Validacoes executadas: `npm run build` (ok) em `HYDRA-BUBBLES`; `npx wrangler deploy src/index.js --dry-run` (ok) em `router`.

## Plano - erro ERESOLVE no autodeploy

- [x] Reproduzir e confirmar que o erro vem do auto-setup do Wrangler tentando instalar `@cloudflare/vite-plugin` (incompativel com Vite 5).
- [x] Blindar o repo com deploy explicito via `wrangler.jsonc` para impedir auto-configuracao no pipeline.
- [x] Executar build e deploy real para validar a correcao ponta a ponta.

## Review - erro ERESOLVE no autodeploy

- [x] Registrar evidencias e comandos finais para usar no deploy automatico sem regressao.

- Confirmacao de causa raiz: `npx wrangler deploy --dry-run` em projeto sem `wrangler.jsonc` (como `website`) reproduz o erro de peer dependency com `@cloudflare/vite-plugin`.
- Repo `HYDRA-BUBBLES` endurecido com scripts `cf:deploy` e `cf:deploy:dry-run`, ambos forcando `--config wrangler.jsonc`.
- `wrangler` fixado em `devDependencies` para reduzir variacao de comportamento entre ambientes de CI.
- Validacao local concluida: `npm run cf:deploy:dry-run` (ok) e `npm run cf:deploy` (ok), versao publicada `ad910b55-fdbc-4931-887e-3939a4ed3fe2` em `https://hydrabubbles.hydrxrd.workers.dev`.
