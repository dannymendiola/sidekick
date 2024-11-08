import type { Delta } from 'quill/core';
import { db, type Moment } from './db';
import { serializeDelta } from '$lib';

/**
 * Add a Moment to the database and insert it in the order after the given Moment
 *
 * @param insertAfter the Moment this one follows, or 'head' or 'tail'
 *
 * Vals:
 * @param name name of the Moment
 * @param attr moment attributes (JSON)
 * @param locations location id array
 * @param characters character id array
 * @param themes theme id array
 */
const addMomentAfter = async (
	insertAfter: Moment | 'root' | 'tail',
	vals: {
		name?: string;
		body?: Delta;
		attr?: JSON;
		locations?: string[];
		characters?: string[];
		themes?: string[];
	}
): Promise<Moment | undefined> => {
	const { name, body, attr, locations, characters, themes } = vals;
	const id = await db.moments.add({
		name: name,
		body: serializeDelta(body),
		attr: JSON.stringify(attr),
		locations: locations,
		characters: characters,
		themes: themes
	});
	const moment = await db.moments.get(id);

	return moment ? await moment.orderAfter(insertAfter) : undefined;
};

export { addMomentAfter };
