import type { Delta } from 'quill/core';
import { db, Moment, Theme, Character, Dynamic, Location } from './db';
import { serializeDelta } from '$lib';
import { MomentAttr, LocationAttr } from '$lib/types/db';
import { type EntityTable } from 'dexie';

type Entity = Moment | Theme | Character | Dynamic | Location;

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
 *
 */
export const addMomentAfter = async (
	insertAfter: Moment | 'root' | 'tail',
	params: MomentParams
): Promise<Moment | undefined> => {
	// const { name, body, attr } = params;
	// const id = await db.moments.add({
	// 	name: name,
	// 	body: body,
	// 	attr: attr,
	// });
	// const moment = await db.moments.get(id);

	// return moment ? await moment.orderAfter(insertAfter) : undefined;
	return await addAfter(insertAfter, params, db.moments);
};

interface MomentParams {
	name?: string;
	body?: Delta;
	attr?: Partial<MomentAttr>;
}

export const addLocationAfter = async (
	insertAfter: Location | 'root' | 'tail',
	params: LocationParams
): Promise<Location | undefined> => {
	return await addAfter(insertAfter, params, db.locations);
};

interface LocationParams {
	name?: string;
	body?: Delta;
	attr?: Partial<LocationAttr>;
}
