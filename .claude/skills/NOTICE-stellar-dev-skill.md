# Stellar Development Skill (copia en este repo)

Las carpetas de skills que estan al lado de este archivo NO son nuestras: son una
copia de la skill oficial de desarrollo de Stellar.

- **Origen:** https://github.com/stellar/stellar-dev-skill
- **Version copiada:** commit `202be802aab27a5fe3076726a7a236378f690af1` (2026-09-14)
- **Licencia:** Apache 2.0 (ver LICENSE-stellar-dev-skill en esta misma carpeta)

## Para que sirve

No es una libreria que Minga use en su codigo: es **conocimiento para el asistente
de IA** con el que programamos. Al estar en `.claude/skills/` del repo, cualquier
sesion de Claude Code que se abra en Minga la carga sola, sin que nadie instale
nada. Cubre contratos Soroban (incluida seguridad y TTL de storage), el SDK de
JavaScript, RPC vs Horizon, wallets, SEPs y estandares.

## Para actualizarla

```bash
git clone --depth 1 https://github.com/stellar/stellar-dev-skill /tmp/sds
cp -r /tmp/sds/skills/. .claude/skills/
cp /tmp/sds/LICENSE .claude/skills/LICENSE-stellar-dev-skill
# y actualizar el commit anotado arriba
```

## Advertencia del propio repo

Stellar aclara que esta skill **fue generada con IA y esta en revision manual**.
Es una referencia muy buena y oficial, pero no es una verdad revelada: si algo
suena raro, hay que verificarlo contra la documentacion de Stellar.
