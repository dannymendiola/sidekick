import { db, Moment, Theme, Character, Dynamic, Location } from './db';
import { type EntityTable } from 'dexie';

type Entity = Moment | Theme | Character | Dynamic | Location;

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
 * Add a Moment to the database and insert it in the order after the given Moment
 */
export const addMomentAfter = async (
	after: Moment | 'root' | 'tail',
	params: PropsOf<Moment>
): Promise<Moment | undefined> => {
	return await addAfter(after, params, db.moments);
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
 * Add a Theme to the database and insert it in the order after the given one
 */
export const addThemeAfter = async (
	after: Theme | 'root' | 'tail',
	params: PropsOf<Theme>
): Promise<Theme | undefined> => {
	return await addAfter(after, params, db.themes);
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
