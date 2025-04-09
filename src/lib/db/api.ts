import { db, Section, Character, Dynamic, Location } from './db';
import { type EntityTable } from 'dexie';

type Entity = Section | Character | Dynamic | Location;

type PropsOf<T extends Entity> = Partial<{
	[K in keyof T as T[K] extends Function ? never : K]: T[K];
}>;

const addAfter = async <T extends Entity>(
	after: T | 'root' | 'tail',
	params: any,
	table: EntityTable<T, 'id'>
): Promise<T | undefined> => {
	const id = await table.add(params);
	const entity = await table.get(id);

	// @ts-ignore
	return entity ? await entity.orderAfter(after) : undefined;
};

/**
 * Add a Section to the database and insert it in the order after the given Section
 */
export const addSectionAfter = async (
	after: Section | 'root' | 'tail',
	params: PropsOf<Section>
): Promise<Section | undefined> => {
	return await addAfter(after, params, db.sections);
};

/**
 * Add a Location to the database and insert it in the order after the given one
 */
export const addLocationAfter = async (
	after: Location | 'root' | 'tail',
	params: PropsOf<Location>
): Promise<Location | undefined> => {
	return await addAfter(after, params, db.locations);
};

/**
 * Add a Character to the database and insert it in the order after the given one
 */
export const addCharacterAfter = async (
	after: Character | 'root' | 'tail',
	params: PropsOf<Character>
): Promise<Character | undefined> => {
	return await addAfter(after, params, db.characters);
};

/**
 * Add a Dynamic to the database and insert it in the order after the given one
 */
export const addDynamicAfter = async (
	after: Dynamic | 'root' | 'tail',
	params: PropsOf<Dynamic>
): Promise<Dynamic | undefined> => {
	return await addAfter(after, params, db.dynamics);
};
