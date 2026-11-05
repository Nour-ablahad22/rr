import type { Attraction, City } from '../types';
import { cities as cityList } from './cities';
import { rheinlandAttractions } from './attractions-rheinland';
import { westAttractions } from './attractions-west';
import { ruhrAttractions } from './attractions-ruhr';
import { westfalenAttractions } from './attractions-westfalen';

export const cities: City[] = cityList;

export const attractions: Attraction[] = [
  ...rheinlandAttractions,
  ...westAttractions,
  ...ruhrAttractions,
  ...westfalenAttractions,
];

export const cityById = new Map(cities.map((c) => [c.id, c]));
export const attractionById = new Map(attractions.map((a) => [a.id, a]));
