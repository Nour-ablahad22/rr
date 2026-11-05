/**
 * Serverseitige Konfiguration. Geheimnisse kommen aus den App-Einstellungen der
 * Function App bzw. Static Web App – idealerweise als Key-Vault-Referenzen:
 *   COSMOS_KEY=@Microsoft.KeyVault(SecretUri=https://<vault>.vault.azure.net/secrets/cosmos-key/)
 * Ohne COSMOS_KEY wird eine verwaltete Identität (DefaultAzureCredential) verwendet.
 */
export const config = {
  provider: (process.env.DATA_PROVIDER ?? (process.env.COSMOS_ENDPOINT ? 'cosmos' : 'memory')) as 'cosmos' | 'memory',
  cosmos: {
    endpoint: process.env.COSMOS_ENDPOINT ?? '',
    key: process.env.COSMOS_KEY || undefined,
    database: process.env.COSMOS_DATABASE ?? 'nrw-explorer',
    containers: { cities: 'cities', attractions: 'attractions', favorites: 'favorites', feedback: 'feedback' },
  },
  corsOrigins: (process.env.CORS_ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  cacheSeconds: Number(process.env.CACHE_SECONDS ?? 300),
};
