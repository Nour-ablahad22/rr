import { CosmosClient, type Container } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import type { Attraction, City, FavoritesDoc } from '../../../shared/types';
import { attractions as seedAttractions, cities as seedCities } from '../../../shared/data/index';
import { config } from '../config';

export interface FeedbackDoc {
  id: string;
  topic: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface Repository {
  listCities(): Promise<City[]>;
  getCity(idOrSlug: string): Promise<City | null>;
  listAttractions(): Promise<Attraction[]>;
  getAttraction(idOrSlug: string): Promise<Attraction | null>;
  listAttractionsByCity(cityId: string): Promise<Attraction[]>;
  getFavorites(userId: string): Promise<FavoritesDoc>;
  addFavorite(userId: string, attractionId: string): Promise<FavoritesDoc>;
  removeFavorite(userId: string, attractionId: string): Promise<FavoritesDoc>;
  saveFeedback(doc: FeedbackDoc): Promise<void>;
}

const emptyFavorites = (userId: string): FavoritesDoc => ({ id: userId, userId, attractionIds: [], updatedAt: new Date().toISOString() });

/** Entwicklungs-Repository: liefert den eingebauten Datensatz, Favoriten im Arbeitsspeicher. */
class MemoryRepository implements Repository {
  private favorites = new Map<string, FavoritesDoc>();
  async listCities() {
    return seedCities;
  }
  async getCity(id: string) {
    return seedCities.find((c) => c.id === id || c.slug === id) ?? null;
  }
  async listAttractions() {
    return seedAttractions;
  }
  async getAttraction(id: string) {
    return seedAttractions.find((a) => a.id === id || a.slug === id) ?? null;
  }
  async listAttractionsByCity(cityId: string) {
    return seedAttractions.filter((a) => a.cityId === cityId);
  }
  async getFavorites(userId: string) {
    return this.favorites.get(userId) ?? emptyFavorites(userId);
  }
  async addFavorite(userId: string, id: string) {
    const doc = await this.getFavorites(userId);
    const next = { ...doc, attractionIds: [...new Set([...doc.attractionIds, id])], updatedAt: new Date().toISOString() };
    this.favorites.set(userId, next);
    return next;
  }
  async removeFavorite(userId: string, id: string) {
    const doc = await this.getFavorites(userId);
    const next = { ...doc, attractionIds: doc.attractionIds.filter((x) => x !== id), updatedAt: new Date().toISOString() };
    this.favorites.set(userId, next);
    return next;
  }
  async saveFeedback() {
    /* im Speichermodus nicht persistiert */
  }
}

/**
 * Cosmos-DB-Repository.
 * Partitionsschlüssel:
 *  - cities:      /id       (kleiner, selten geänderter Katalog)
 *  - attractions: /cityId   (typische Abfrage "alle Orte einer Stadt" bleibt in einer Partition)
 *  - favorites:   /userId   (Punktlesezugriff je Gast-ID)
 *  - feedback:    /topic
 * Kataloge werden kurzzeitig im Speicher der Function-Instanz gecacht.
 */
class CosmosRepository implements Repository {
  private cache = new Map<string, { at: number; value: unknown }>();
  private containers: Record<keyof typeof config.cosmos.containers, Container>;

  constructor() {
    const client = config.cosmos.key
      ? new CosmosClient({ endpoint: config.cosmos.endpoint, key: config.cosmos.key })
      : new CosmosClient({ endpoint: config.cosmos.endpoint, aadCredentials: new DefaultAzureCredential() });
    const db = client.database(config.cosmos.database);
    const c = config.cosmos.containers;
    this.containers = { cities: db.container(c.cities), attractions: db.container(c.attractions), favorites: db.container(c.favorites), feedback: db.container(c.feedback) };
  }

  private async cached<T>(key: string, load: () => Promise<T>): Promise<T> {
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < config.cacheSeconds * 1000) return hit.value as T;
    const value = await load();
    this.cache.set(key, { at: Date.now(), value });
    return value;
  }

  private strip<T>(doc: T & { _rid?: string }): T {
    const { _rid, _self, _etag, _attachments, _ts, ...rest } = doc as Record<string, unknown>;
    void _rid; void _self; void _etag; void _attachments; void _ts;
    return rest as T;
  }

  listCities() {
    return this.cached('cities', async () => (await this.containers.cities.items.readAll<City>().fetchAll()).resources.map((d) => this.strip(d)));
  }
  async getCity(id: string) {
    return (await this.listCities()).find((c) => c.id === id || c.slug === id) ?? null;
  }
  listAttractions() {
    return this.cached('attractions', async () => (await this.containers.attractions.items.readAll<Attraction>().fetchAll()).resources.map((d) => this.strip(d)));
  }
  async getAttraction(id: string) {
    return (await this.listAttractions()).find((a) => a.id === id || a.slug === id) ?? null;
  }
  listAttractionsByCity(cityId: string) {
    return this.cached(`city:${cityId}`, async () => {
      const { resources } = await this.containers.attractions.items
        .query<Attraction>({ query: 'SELECT * FROM c WHERE c.cityId = @cityId', parameters: [{ name: '@cityId', value: cityId }] }, { partitionKey: cityId })
        .fetchAll();
      return resources.map((d) => this.strip(d));
    });
  }
  async getFavorites(userId: string) {
    try {
      const { resource } = await this.containers.favorites.item(userId, userId).read<FavoritesDoc>();
      return resource ? this.strip(resource) : emptyFavorites(userId);
    } catch (e) {
      if ((e as { code?: number }).code === 404) return emptyFavorites(userId);
      throw e;
    }
  }
  async addFavorite(userId: string, id: string) {
    const doc = await this.getFavorites(userId);
    const next = { ...doc, attractionIds: [...new Set([...doc.attractionIds, id])], updatedAt: new Date().toISOString() };
    await this.containers.favorites.items.upsert(next);
    return next;
  }
  async removeFavorite(userId: string, id: string) {
    const doc = await this.getFavorites(userId);
    const next = { ...doc, attractionIds: doc.attractionIds.filter((x) => x !== id), updatedAt: new Date().toISOString() };
    await this.containers.favorites.items.upsert(next);
    return next;
  }
  async saveFeedback(doc: FeedbackDoc) {
    await this.containers.feedback.items.create(doc);
  }
}

let instance: Repository | null = null;
export function getRepository(): Repository {
  if (!instance) instance = config.provider === 'cosmos' && config.cosmos.endpoint ? new CosmosRepository() : new MemoryRepository();
  return instance;
}
