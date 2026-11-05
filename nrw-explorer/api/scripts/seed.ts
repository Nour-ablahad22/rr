/**
 * Legt Datenbank und Container in Azure Cosmos DB an und spielt den Startdatensatz ein.
 *   COSMOS_ENDPOINT=... COSMOS_KEY=... npm run seed
 * (ohne COSMOS_KEY wird DefaultAzureCredential / Azure-CLI-Anmeldung verwendet)
 */
import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import { attractions, cities } from '../../shared/data/index';
import { config } from '../src/config';

async function main() {
  if (!config.cosmos.endpoint) throw new Error('COSMOS_ENDPOINT ist nicht gesetzt.');
  const client = config.cosmos.key
    ? new CosmosClient({ endpoint: config.cosmos.endpoint, key: config.cosmos.key })
    : new CosmosClient({ endpoint: config.cosmos.endpoint, aadCredentials: new DefaultAzureCredential() });
  const { database } = await client.databases.createIfNotExists({ id: config.cosmos.database });
  const c = config.cosmos.containers;
  const { container: citiesC } = await database.containers.createIfNotExists({ id: c.cities, partitionKey: { paths: ['/id'] } });
  const { container: attrC } = await database.containers.createIfNotExists({ id: c.attractions, partitionKey: { paths: ['/cityId'] } });
  await database.containers.createIfNotExists({ id: c.favorites, partitionKey: { paths: ['/userId'] } });
  await database.containers.createIfNotExists({ id: c.feedback, partitionKey: { paths: ['/topic'] }, defaultTtl: 60 * 60 * 24 * 365 });
  for (const city of cities) await citiesC.items.upsert(city);
  for (const a of attractions) await attrC.items.upsert(a);
  console.log(`Eingespielt: ${cities.length} Städte, ${attractions.length} Sehenswürdigkeiten in "${config.cosmos.database}".`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
