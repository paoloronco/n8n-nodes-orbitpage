# Security

Report suspected vulnerabilities privately to `contact@orbitpage.com`. Do not
open a public issue containing tokens, response bodies, tenant identifiers or
other sensitive data.

OrbitPage personal and operator API tokens are bearer secrets. Store them only
in n8n credentials, grant the smallest required scopes, use finite expiry where
possible and revoke them immediately after suspected disclosure.
