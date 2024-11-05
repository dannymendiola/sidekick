import { describe, it, expect, beforeAll, afterAll, vi, test, afterEach } from 'vitest';

import { addMomentAfter } from './api';
import { db, MOMENT_ORDER_STEP, MOMENT_MIN_ORDER_FRAC, type Character } from './db';

describe('Moments', () => {
	afterEach(async () => {
		await Promise.all(db.tables.map((table) => table.clear()));
	});

	it('Moment ordering and deletion', async () => {
		let momentA = await addMomentAfter('root', { name: 'Moment A' });

		expect(momentA).toBeTruthy();
		expect(momentA?.name).toBe('Moment A');

		let momentB = await addMomentAfter(momentA!, { name: 'Moment B' });
		expect(await db.moments.count()).toBe(2);

		expect(momentA!.order).toBe(0);
		expect(momentB!.order).toEqual(MOMENT_ORDER_STEP);

		let aNext = await (await db.moments.get(momentA!.id))!.getNext();
		expect(aNext!.name).toBe('Moment B');

		let momentC = await addMomentAfter('root', { name: 'Moment C' });
		expect(momentC!.order).toBe(0);

		momentA = await db.moments.get(momentA!.id);
		expect(momentA!.order).toEqual(MOMENT_ORDER_STEP / 2);

		let momentD = await addMomentAfter('tail', { name: 'Moment D' });
		expect(momentD!.order).toBe(MOMENT_ORDER_STEP * 2);

		let momentE = await addMomentAfter('tail', { name: 'Moment E' });
		expect(momentE!.order).toBe(MOMENT_ORDER_STEP * 3);

		await momentD!.delete();

		let bNext = await (await db.moments.get(momentB!.id))!.getNext();
		expect(bNext!.name).toBe('Moment E');
	});

	it('Moment rebalancing', async () => {
		/* slices = number of times to divide MOMENT_ORDER_STEP before an index
            goes below 0.001 */
		let slices = Math.ceil(Math.log2(MOMENT_ORDER_STEP / MOMENT_MIN_ORDER_FRAC)) + 1;
		for (let i = 0; i < slices; i++) {
			await addMomentAfter('root', { name: `${i}` });
		}
		let secondMoment = (await db.moments.orderBy('order').toArray())[1];

		expect(secondMoment.order).within(MOMENT_MIN_ORDER_FRAC, 1);

		let orderBefore = (await db.moments.orderBy('order').toArray()).map((m) => m.name);

		await addMomentAfter('root', { name: `${slices}` });
		secondMoment = (await db.moments.orderBy('order').toArray())[1];

		expect(secondMoment.order).equals(MOMENT_ORDER_STEP);

		let orderAfter = (await db.moments.orderBy('order').toArray()).map((m) => m.name).slice(1);

		let changedOrder = false;

		for (let i = 0; i < orderBefore.length; i++) {
			if (orderBefore[i] !== orderAfter[i]) {
				changedOrder = true;
				break;
			}
		}

		expect(changedOrder).toBeFalsy();

		db.moments.clear();

		let moment1 = await addMomentAfter('root', { name: '1' });
		let moment2 = await addMomentAfter(moment1!, { name: '2' });
		await addMomentAfter(moment2!, { name: '3' });

		let preceding = moment2;

		for (let i = 0; i < slices - 1; i++) {
			preceding = await addMomentAfter(preceding!, { name: `${i + 3}` });
		}

		(await db.moments.orderBy('order').last())!.delete();
		const lastMoment = await db.moments.orderBy('order').last();
		const lastFrac = Math.ceil(lastMoment!.order!) - lastMoment!.order!;

		expect(lastFrac).toEqual(0);
	});

	it('Links between moments and other entities', async () => {
		let moment1 = await addMomentAfter('root', { name: 'Moment 1' });
		let moment2 = await addMomentAfter(moment1!, { name: 'Moment 2' });

		const location1Id = await db.locations.add({ name: 'Location 1' });
		const location1 = await db.locations.get(location1Id);

		// link moment 1 to location 1
		await moment1!.link((await db.locations.get(location1Id))!);

		expect((await moment1!.getLocations()).length).toBe(1);
		expect((await moment1!.getLocations())[0].name).toBe('Location 1');
		expect((await location1!.getMoments())[0].id).toBe(moment1!.id);

		const character1Id = await db.characters.add({ name: 'Character 1' });
		const character1 = await db.characters.get(character1Id);

		// link moment 2 to character 1
		await moment2!.link((await db.characters.get(character1Id))!);

		expect((await moment2!.getCharacters())[0].name).toBe('Character 1');
		expect((await character1!.getMoments())[0].id).toBe(moment2!.id);
	});

	it('Moment attr', async () => {
		let moment1Id = await db.moments.add({
			name: 'Moment 1',
			attr: JSON.stringify({
				significance: 'This is when he finds out who his father is'
			})
		});
		let moment1 = await db.moments.get(moment1Id);
		expect(moment1!.getAttr().significance).toBe('This is when he finds out who his father is');
		await moment1!.updateAttr({
			conflict: 'His father is not a great guy'
		});
		expect(moment1!.getAttr().conflict).toBe('His father is not a great guy');
	});
});

describe('Locations', () => {
	afterEach(async () => {
		await Promise.all(db.tables.map((table) => table.clear()));
	});

	it('Location attr', async () => {
		let location1Id = await db.locations.add({
			name: 'Location 1',
			attr: JSON.stringify({
				description: 'This is a place in the story'
			})
		});
		let location1 = await db.locations.get(location1Id);

		expect(location1!.getAttr().description).toBe('This is a place in the story');
	});
});

describe('Characters', () => {
	afterAll(async () => {
		await Promise.all(db.tables.map((table) => table.clear()));
	});

	it('Create dynamic', async () => {
		const aliceId = await db.characters.add({ name: 'Alice' });
		let alice = await db.characters.get(aliceId);
		const bobId = await db.characters.add({ name: 'Bob' });
		let bob = await db.characters.get(bobId);
		const charlieId = await db.characters.add({ name: 'Charlie' });
		let charlie = await db.characters.get(charlieId);

		await alice!.createDynamic(bobId);
		let dynamicAC = await alice!.createDynamic(charlieId);

		// Alice -> Bob, Charlie
		// Bob -> Alice
		// Charlie -> Alice

		expect((await alice!.getDynamics()).length).toBe(2);
		expect((await bob!.getDynamics()).length).toBe(1);
		expect((await charlie!.getDynamics()).length).toBe(1);

		expect((await bob!.relatedCharacters())[0].name === 'Alice');

		dynamicAC!.updateAttr({
			shared_goals: 'Defeat Bob'
		});

		expect(await db.dynamics.count()).toBe(2);
		await bob!.createDynamic(alice!.id);
		expect(await db.dynamics.count()).toBe(2);
	});

	it('Get dynamic with', async () => {
		const alice = await db.characters.where('name').equals('Alice').first();
		const charlie = await db.characters.where('name').equals('Charlie').first();

		expect(alice).toBeTruthy();
		expect(charlie).toBeTruthy();

		const dynamic = await alice?.getDynamicWith(charlie!.id);
		expect(dynamic).toBeTruthy();
		const dynFromCharlie = await charlie?.getDynamicWith(alice!.id);
		expect(dynFromCharlie).toBeTruthy();

		expect(dynamic).toEqual(dynFromCharlie);

		expect(dynamic?.getAttr().shared_goals).toBe('Defeat Bob');
	});

	it('Remove dynamic', async () => {
		expect(await db.dynamics.count()).toBe(2);
		const alice = await db.characters.where('name').equals('Alice').first();
		const bob = await db.characters.where('name').equals('Bob').first();

		await alice!.removeDynamic(bob!.id);
		expect(await db.dynamics.count()).toBe(1);
		expect((await alice!.getDynamics()).length).toBe(1);
		expect((await bob!.getDynamics()).length).toBe(0);

		await bob!.createDynamic(alice!.id);
	});

	it('Remove character and cascade', async () => {
		const momentId = await db.moments.add({
			name: 'Moment 1',
			body: "{'ops':[{'insert':'Alice and Charlie vanquish the dark lord'}]}"
		});
		let moment = await db.moments.get(momentId);
		const bob = await db.characters.where('name').equals('Bob').first();
		const alice = await db.characters.where('name').equals('Alice').first();
		const charlie = await db.characters.where('name').equals('Charlie').first();

		await moment!.link(bob!);
		await moment!.link(alice!);
		await moment!.link(charlie!);

		expect((await alice!.getDynamics()).length).toBe(2);
		expect(moment!.characters!.length).toBe(3);

		await bob!.delete();

		expect((await alice!.getDynamics()).length).toBe(1);

		moment = await db.moments.get(momentId);
		expect(moment!.characters!.length).toBe(2);

		await Promise.all(db.tables.map((table) => table.clear()));
	});

	it('Character attr', async () => {
		let characterId = await db.characters.add({
			name: 'Character 1'
		});
		let character = await db.characters.get(characterId);

		await character?.updateAttr({
			flaws: 'Smells bad'
		});

		expect(character?.getAttr().flaws).toBe('Smells bad');
	});
});
