import type { Delta } from 'quill/core';
import { db, type Moment } from './db';
import { serializeDelta } from '$lib';

/**
 * Add a moment to the database
 *
 * @param insertAfter the Moment this one follows, or 'head' or 'tail'
 * @param name name of the moment
 * @param attr moment attributes (JSON)
 * @param locations location id array
 * @param characters character id array
 * @param themes theme id array
 * @param targetDB if not provided, defaults to the `sidekick` database. Generally only provided during testing
 */
const addMomentAfter = async (
	insertAfter: Moment | 'root' | 'tail',
	vals: {
		name?: string;
		body?: Delta;
		attr?: JSON;
		locations?: number[];
		characters?: number[];
		themes?: number[];
	},
	targetDB = db
): Promise<Moment | undefined> => {
	const { name, body, attr, locations, characters, themes } = vals;
	const id = await targetDB.moments.add({
		name: name,
		body: serializeDelta(body),
		attr: JSON.stringify(attr),
		locations: locations,
		characters: characters,
		themes: themes
	});
	const moment = await targetDB.moments.get(id);

	await moment!.orderAfter(insertAfter, targetDB);

	return moment;
};

export { addMomentAfter };
