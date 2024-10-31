import Dexie, { type EntityTable } from 'dexie';
import { describe, it, expect, beforeAll, afterAll, vi, test } from 'vitest';

// WARNING: pass the test db into EVERY api call, or it will run on the default db
import { addMomentAfter } from './api';
import { Moment, Location, Character, CharacterRelationship, Theme, MOMENT_ORDER_STEP } from './db';

const testDB = new Dexie('test') as Dexie & {
	moments: EntityTable<Moment, 'id'>;
	locations: EntityTable<Location, 'id'>;
	characters: EntityTable<Character, 'id'>;
	character_relationships: EntityTable<CharacterRelationship, 'id'>;
	themes: EntityTable<Theme, 'id'>;
};

testDB.version(1).stores({
	moments: '++id, name, order, *locations, *characters, *themes',
	locations: '++id, name',
	characters: '++id, name',
	character_relationships: '++id, &[aCharId+bCharId], aCharId, bCharId',
	themes: '++id, name'
});

testDB.moments.mapToClass(Moment);
testDB.locations.mapToClass(Location);
testDB.characters.mapToClass(Character);
testDB.character_relationships.mapToClass(CharacterRelationship);
testDB.themes.mapToClass(Theme);

describe('db API', () => {
	it('Moment ordering', async () => {
		let momentA = await addMomentAfter('root', { name: 'Moment A' }, testDB);

		expect(momentA).toBeTruthy();
		expect(momentA?.name).toBe('Moment A');

		let momentB = await addMomentAfter(momentA!, { name: 'Moment B' }, testDB);
		expect(await testDB.moments.count()).toBe(2);

		expect(momentA!.order).toBe(0);
		expect(momentB!.order).toEqual(MOMENT_ORDER_STEP);

		let momentC = await addMomentAfter('root', { name: 'Moment C' }, testDB);
		expect(momentC!.order).toBe(0);

		momentA = await testDB.moments.get(momentA!.id);
		expect(momentA!.order).toEqual(MOMENT_ORDER_STEP / 2);

		let momentD = await addMomentAfter('tail', { name: 'Moment D' }, testDB);
		expect(momentD!.order).toBe(MOMENT_ORDER_STEP * 2);

		let momentE = await addMomentAfter('tail', { name: 'Moment E' }, testDB);
		expect(momentE!.order).toBe(MOMENT_ORDER_STEP * 3);

		testDB.moments.clear();
	});

	it('Moment rebalancing', async () => {
		/* slices = number of times to divide MOMENT_ORDER_STEP before an index
            goes below 0.001 */
		let slices = Math.ceil(Math.log2(MOMENT_ORDER_STEP / 0.001)) + 1;
		for (let i = 0; i < slices; i++) {
			await addMomentAfter('root', { name: `${i}` }, testDB);
		}
		let secondMoment = (await testDB.moments.orderBy('order').toArray())[1];

		expect(secondMoment.order).within(0.001, 1);

		let orderBefore = (await testDB.moments.orderBy('order').toArray()).map((m) => m.name);

		await addMomentAfter('root', { name: `${slices}` }, testDB);
		secondMoment = (await testDB.moments.orderBy('order').toArray())[1];

		expect(secondMoment.order).equals(MOMENT_ORDER_STEP);

		let orderAfter = (await testDB.moments.orderBy('order').toArray()).map((m) => m.name).slice(1);

		let changedOrder = false;

		for (let i = 0; i < orderBefore.length; i++) {
			if (orderBefore[i] !== orderAfter[i]) {
				changedOrder = true;
				break;
			}
		}

		expect(changedOrder).toBeFalsy();

		await testDB.moments.clear();
	});
});
