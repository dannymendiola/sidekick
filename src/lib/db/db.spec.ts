import { describe, it, expect, afterAll, afterEach } from 'vitest';

import { addMomentAfter, addLocationAfter, addCharacterAfter } from './api';
import { db, ORDER_STEP, ORDER_MIN_FRAC } from './db';

const slices = Math.ceil(Math.log2(ORDER_STEP / ORDER_MIN_FRAC)) + 1;

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
		expect(momentB!.order).toEqual(ORDER_STEP);

		let aNext = await (await db.moments.get(momentA!.id))!.getNext();
		expect(aNext!.name).toBe('Moment B');

		let momentC = await addMomentAfter('root', { name: 'Moment C' });
		expect(momentC!.order).toBe(0);

		momentA = await db.moments.get(momentA!.id);
		expect(momentA!.order).toEqual(ORDER_STEP / 2);

		let momentD = await addMomentAfter('tail', { name: 'Moment D' });
		expect(momentD!.order).toBe(ORDER_STEP * 2);

		let momentE = await addMomentAfter('tail', { name: 'Moment E' });
		expect(momentE!.order).toBe(ORDER_STEP * 3);

		await momentD!.delete();

		let bNext = await (await db.moments.get(momentB!.id))!.getNext();
		expect(bNext!.name).toBe('Moment E');
	});

	it('Rebalancing', async () => {
		/* slices = number of times to divide MOMENT_ORDER_STEP before an index
            goes below 0.001 */
		for (let i = 0; i < slices; i++) {
			await addMomentAfter('root', { name: `${i}` });
		}
		let secondMoment = (await db.moments.orderBy('order').toArray())[1];

		expect(secondMoment.order).within(ORDER_MIN_FRAC, 1);

		let orderBefore = (await db.moments.orderBy('order').toArray()).map((m) => m.name);

		await addMomentAfter('root', { name: `${slices}` });
		secondMoment = (await db.moments.orderBy('order').toArray())[1];

		expect(secondMoment.order).equals(ORDER_STEP);

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

	it('Links between moments and other elements', async () => {
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
			attr: {
				significance: 'This is when he finds out who his father is'
			}
		});
		let moment1 = (await db.moments.get(moment1Id))!;
		expect(moment1.attr!.significance).toBe('This is when he finds out who his father is');
		await moment1.updateAttr({ conflict: 'His father is not a great guy' });
		expect(moment1.attr!.conflict).toBe('His father is not a great guy');
		expect(moment1.attr!.significance).toBe('This is when he finds out who his father is');
	});

	it('Clean attr', async () => {
		let moment = (await addMomentAfter('tail', { name: 'Moment' }))!;
		moment.updateAttr({ conflict: 'This moment has no driving force', driving_force: '' });

		expect(moment.attr?.driving_force).toBe('');
		await moment.cleanAttr();
		expect(moment.attr?.driving_force).toBe(undefined);
		expect(moment.attr?.conflict).toBe('This moment has no driving force');
	});
});

describe('Locations', () => {
	afterEach(async () => {
		await Promise.all(db.tables.map((table) => table.clear()));
	});

	it('Location ordering and deletion', async () => {
		let alcatraz = (await addLocationAfter('root', { name: 'Alcatraz' }))!;
		let berlin = (await addLocationAfter(alcatraz, { name: 'Berlin' }))!;

		expect(alcatraz!.order).toBe(0);
		expect(berlin!.order).toEqual(ORDER_STEP);

		let bFromA = await alcatraz!.getNext();
		expect(bFromA!.name).toBe('Berlin');

		let aFromB = await berlin!.getPrev();
		expect(aFromB!.name).toBe('Alcatraz');

		let costco = (await addLocationAfter('tail', { name: 'Costco' }))!;
		expect((await costco.getPrev())!.name).toBe('Berlin');

		berlin.delete();

		expect((await costco.getPrev())!.name).toBe('Alcatraz');
	});

	it('Character <-> Location', async () => {
		let alcatraz = (await addLocationAfter('root', { name: 'Alcatraz' }))!;
		let alCapone = (await addCharacterAfter('root', { name: 'Al Capone' }))!;
		alCapone.addLocation(alcatraz.id);
		expect((await alcatraz.getCharacters())[0].name).toBe('Al Capone');
		expect((await alCapone.getLocations())[0].name).toBe('Alcatraz');
	});

	it('Location attr', async () => {
		let location1Id = await db.locations.add({
			name: 'Location 1',
			attr: {
				description: 'This is a place in the story'
			}
		});
		let location1 = (await db.locations.get(location1Id))!;

		expect(location1.attr!.description).toBe('This is a place in the story');
		await location1.updateAttr({ history: "This place's got history" });

		expect(location1.attr!.description).toBe('This is a place in the story');
		expect(location1.attr!.history).toBe("This place's got history");
	});

	it('Clean attr', async () => {
		let loc = (await addLocationAfter('tail', { name: 'Atlantis' }))!;
		loc.updateAttr({ significance: "Nobody knows what this place's deal is", history: '' });

		expect(loc.attr?.history).toBe('');
		await loc.cleanAttr();
		expect(loc.attr?.history).toBe(undefined);
		expect(loc.attr?.significance).toBe("Nobody knows what this place's deal is");
	});
});

describe('Characters', () => {
	afterAll(async () => {
		await Promise.all(db.tables.map((table) => table.clear()));
	});

	it('Order', async () => {
		let alice = (await addCharacterAfter('root', { name: 'Alice' }))!;
		let bob = (await addCharacterAfter(alice, { name: 'Bob' }))!;

		expect(alice!.order).toBe(0);
		expect(bob!.order).toEqual(ORDER_STEP);

		let charlie = (await addCharacterAfter(alice, { name: 'Charlie' }))!;

		expect((await charlie.getPrev())!.name).toEqual('Alice');
		expect((await charlie.getNext())!.name).toEqual('Bob');

		expect((await alice.getNext())!.name).toEqual('Charlie');

		await charlie.delete();

		expect((await bob.getPrev())!.name).toEqual('Alice');

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

		let dynamic = await alice?.getDynamicWith(charlie!.id);
		expect(dynamic).toBeTruthy();
		dynamic = dynamic!;
		const dynFromCharlie = await charlie?.getDynamicWith(alice!.id);
		expect(dynFromCharlie).toBeTruthy();

		expect(dynamic).toEqual(dynFromCharlie);

		expect(dynamic.attr!.shared_goals).toBe('Defeat Bob');
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
			name: 'Moment 1'
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
		let character = (await db.characters.get(characterId))!;

		await character?.updateAttr({
			flaws: 'Smells bad'
		});

		expect(character.attr!.flaws).toBe('Smells bad');

		await character.updateAttr({ moral_code: 'Does not include showering' });
		expect(character.attr!.flaws).toBe('Smells bad');
		expect(character.attr!.moral_code).toBe('Does not include showering');
	});

	it('Clean character attr', async () => {
		let character = (await addCharacterAfter('tail', { name: 'Atlantis' }))!;
		character.updateAttr({ flaws: 'Lacks emotional intelligence', emotional_intelligence: '' });

		expect(character.attr?.emotional_intelligence).toBe('');
		await character.cleanAttr();
		expect(character.attr?.emotional_intelligence).toBe(undefined);
		expect(character.attr?.flaws).toBe('Lacks emotional intelligence');
	});

	it('Dynamic attr', async () => {
		const aliceId = await db.characters.add({ name: 'Alice' });
		let alice = (await db.characters.get(aliceId))!;
		const charlieId = await db.characters.add({ name: 'Charlie' });
		let charlie = (await db.characters.get(charlieId))!;

		let dynamic = (await alice.createDynamic(charlie.id))!;
		await dynamic.updateAttr({ conflict_sources: 'Alice wanted to be the one to defeat Bob' });

		expect(dynamic.attr!.conflict_sources).toBe('Alice wanted to be the one to defeat Bob');

		await dynamic.updateAttr({ shared_goals: 'Grieve Bob' });
		expect(dynamic.attr!.conflict_sources).toBe('Alice wanted to be the one to defeat Bob');
		expect(dynamic.attr!.shared_goals).toBe('Grieve Bob');
	});

	it('Clean dynamic attr', async () => {
		let alice = (await addCharacterAfter('tail', { name: 'Alice' }))!;
		let bob = (await addCharacterAfter('tail', { name: 'Bob' }))!;
		let dynamic = (await alice.createDynamic(bob.id))!;
		dynamic.updateAttr({ conflict_sources: 'Simply incompatible', chemistry: '' });

		expect(dynamic.attr?.chemistry).toBe('');
		await dynamic.cleanAttr();
		expect(dynamic.attr?.chemistry).toBe(undefined);
		expect(dynamic.attr?.conflict_sources).toBe('Simply incompatible');
	});
});
