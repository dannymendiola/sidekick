import { describe, it, expect, afterAll, afterEach } from 'vitest';

import { addSectionAfter, addLocationAfter, addCharacterAfter } from '$lib';
import { db, ORDER_STEP, ORDER_MIN_FRAC } from '$lib';
import { ulid } from 'ulidx';

const slices = Math.ceil(Math.log2(ORDER_STEP / ORDER_MIN_FRAC)) + 1;

describe('Projects', () => {
	it('Differentiate Characters by their associated Projects', async () => {
		const project1ID = await db.projects.add({ name: 'Project 1' });
		const project2ID = await db.projects.add({ name: 'Project 2' });

		// Create a Character under each Project
		const p1c = await addCharacterAfter('root', {
			name: 'One',
			project: project1ID
		});
		const p2c = await addCharacterAfter('root', {
			name: 'Uno',
			project: project2ID
		});

		// Verify that the Characters are associated with the correct Projects
		expect(p1c).toBeTruthy();
		expect(p2c).toBeTruthy();

		expect(p1c!.project).toBe(project1ID);
		expect(p2c!.project).toBe(project2ID);

		// Ensure Characters can be differentiated by their Projects
		const project1Characters = await db.characters.where('project').equals(project1ID).toArray();
		const project2Characters = await db.characters.where('project').equals(project2ID).toArray();

		expect(project1Characters.length).toBe(1);
		expect(project2Characters.length).toBe(1);

		expect(project1Characters[0].name).toBe('One');
		expect(project2Characters[0].name).toBe('Uno');
	});

	// TODO
	// it('Ordering should be local to Project', async () => {
	// 	// Grab projects and characters from previous test
	// 	const project1ID = (await db.projects.where('name').equals('Project 1').first())?.id!;
	// 	const project2ID = (await db.projects.where('name').equals('Project 2').first())?.id!;

	// 	let p1Chars = await db.characters.where('project').equals(project1ID).toArray();
	// 	let p2Chars = await db.characters.where('project').equals(project2ID).toArray();

	// 	expect(p1Chars[0].name).toBe('One');
	// 	expect(p2Chars[0].name).toBe('Uno');

	// 	const proj1char2ID = (await addCharacterAfter(p1Chars[0], { name: 'Two' }))!;
	// 	const proj2char2ID = (await addCharacterAfter(p2Chars[0], { name: 'Dos' }))!;

	// 	const two = await db.characters.get(proj1char2ID.id);
	// 	const dos = await db.characters.get(proj2char2ID.id);

	// 	console.log({ two, dos });

	// 	expect((await two?.getPrev())?.name).toBe('One');
	// 	expect((await dos?.getPrev())?.name).toBe('Uno');
	// });
});

describe('Sections', () => {
	afterEach(async () => {
		await Promise.all(db.tables.map((table) => table.clear()));
	});

	it('Section ordering and deletion', async () => {
		const project = ulid();

		let sectionA = await addSectionAfter('root', { name: 'Section A', project });

		expect(sectionA).toBeTruthy();
		expect(sectionA?.name).toBe('Section A');

		let sectionB = await addSectionAfter(sectionA!, { name: 'Section B', project });
		expect(await db.sections.count()).toBe(2);

		expect(sectionA!.order).toBe(0);
		expect(sectionB!.order).toEqual(ORDER_STEP);

		let aNext = await (await db.sections.get(sectionA!.id))!.getNext();
		expect(aNext!.name).toBe('Section B');

		let sectionC = await addSectionAfter('root', { name: 'Section C', project });
		expect(sectionC!.order).toBe(0);

		sectionA = await db.sections.get(sectionA!.id);
		expect(sectionA!.order).toEqual(ORDER_STEP / 2);

		let sectionD = await addSectionAfter('tail', { name: 'Section D', project });
		expect(sectionD!.order).toBe(ORDER_STEP * 2);

		let sectionE = await addSectionAfter('tail', { name: 'Section E', project });
		expect(sectionE!.order).toBe(ORDER_STEP * 3);

		await sectionD!.delete();

		let bNext = await (await db.sections.get(sectionB!.id))!.getNext();
		expect(bNext!.name).toBe('Section E');
	});

	it('Rebalancing', async () => {
		const project = 'rebalancing_test';
		/* slices = number of times to divide ORDER_STEP before an index
            goes below 0.001 */
		for (let i = 0; i < slices; i++) {
			await addSectionAfter('root', { name: `${i}`, project });
		}
		let secondSection = (await db.sections.orderBy('order').toArray())[1];

		expect(secondSection.order).within(ORDER_MIN_FRAC, 1);

		let orderBefore = (await db.sections.orderBy('order').toArray()).map((m) => m.name);

		await addSectionAfter('root', { name: `${slices}`, project });
		secondSection = (await db.sections.orderBy('order').toArray())[1];

		expect(secondSection.order).equals(ORDER_STEP);

		let orderAfter = (await db.sections.orderBy('order').toArray()).map((m) => m.name).slice(1);

		let changedOrder = false;

		for (let i = 0; i < orderBefore.length; i++) {
			if (orderBefore[i] !== orderAfter[i]) {
				changedOrder = true;
				break;
			}
		}

		expect(changedOrder).toBeFalsy();

		db.sections.clear();

		let section1 = await addSectionAfter('root', { name: '1', project });
		let section2 = await addSectionAfter(section1!, { name: '2', project });
		await addSectionAfter(section2!, { name: '3', project });

		let preceding = section2;

		for (let i = 0; i < slices - 1; i++) {
			preceding = await addSectionAfter(preceding!, { name: `${i + 3}`, project });
		}

		(await db.sections.orderBy('order').last())!.delete();
		const lastSection = await db.sections.orderBy('order').last();
		const lastFrac = Math.ceil(lastSection!.order!) - lastSection!.order!;

		expect(lastFrac).toEqual(0);
	});

	it('Links between sections and other elements', async () => {
		let section1 = await addSectionAfter('root', { name: 'Section 1' });
		let section2 = await addSectionAfter(section1!, { name: 'Section 2' });

		const location1Id = await db.locations.add({ name: 'Location 1' });
		const location1 = await db.locations.get(location1Id);

		// link section 1 to location 1
		await section1!.link((await db.locations.get(location1Id))!);

		expect((await section1!.getLocations()).length).toBe(1);
		expect((await section1!.getLocations())[0].name).toBe('Location 1');
		expect((await location1!.getSections())[0].id).toBe(section1!.id);

		const character1Id = await db.characters.add({ name: 'Character 1' });
		const character1 = await db.characters.get(character1Id);

		// link section 2 to character 1
		await section2!.link((await db.characters.get(character1Id))!);

		expect((await section2!.getCharacters())[0].name).toBe('Character 1');
		expect((await character1!.getSections())[0].id).toBe(section2!.id);
	});

	it('Section attr', async () => {
		let section1Id = await db.sections.add({
			name: 'Section 1',
			attr: {
				significance: 'This is when he finds out who his father is'
			}
		});
		let section1 = (await db.sections.get(section1Id))!;
		expect(section1.attr!.significance).toBe('This is when he finds out who his father is');
		await section1.updateAttr({ conflict: 'His father is not a great guy' });
		expect(section1.attr!.conflict).toBe('His father is not a great guy');
		expect(section1.attr!.significance).toBe('This is when he finds out who his father is');
	});

	it('Clean attr', async () => {
		let section = (await addSectionAfter('tail', { name: 'Section' }))!;
		section.updateAttr({
			conflict: 'This part of the story has no driving force',
			driving_force: ''
		});

		expect(section.attr?.driving_force).toBe('');
		await section.cleanAttr();
		expect(section.attr?.driving_force).toBe(undefined);
		expect(section.attr?.conflict).toBe('This part of the story has no driving force');
	});
});

describe('Locations', () => {
	afterEach(async () => {
		await Promise.all(db.tables.map((table) => table.clear()));
	});

	it('Location ordering and deletion', async () => {
		const project = 'location_ordering_test';
		let alcatraz = (await addLocationAfter('root', { name: 'Alcatraz', project }))!;
		let berlin = (await addLocationAfter(alcatraz, { name: 'Berlin', project }))!;

		expect(alcatraz!.order).toBe(0);
		expect(berlin!.order).toEqual(ORDER_STEP);

		let bFromA = await alcatraz!.getNext();
		expect(bFromA!.name).toBe('Berlin');

		let aFromB = await berlin!.getPrev();
		expect(aFromB!.name).toBe('Alcatraz');

		let costco = (await addLocationAfter('tail', { name: 'Costco', project }))!;
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

	it('Character ordering and deletion', async () => {
		const project = 'character_ordering_test';

		let alice = (await addCharacterAfter('root', { name: 'Alice', project }))!;
		let bob = (await addCharacterAfter(alice, { name: 'Bob', project }))!;

		expect(alice!.order).toBe(0);
		expect(bob!.order).toEqual(ORDER_STEP);

		let bFromA = await alice!.getNext();
		expect(bFromA!.name).toBe('Bob');

		let aFromB = await bob!.getPrev();
		expect(aFromB!.name).toBe('Alice');

		let charlie = (await addCharacterAfter('tail', { name: 'Charlie', project }))!;
		expect((await charlie.getPrev())!.name).toBe('Bob');

		bob = await bob.refresh();
		bob.delete();

		expect((await (await charlie.refresh()).getPrev())!.name).toBe('Alice');

		alice.delete();
		charlie.delete();
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
		const sectionID = await db.sections.add({
			name: 'Section 1'
		});
		let section = await db.sections.get(sectionID);
		const bob = await db.characters.where('name').equals('Bob').first();
		const alice = await db.characters.where('name').equals('Alice').first();
		const charlie = await db.characters.where('name').equals('Charlie').first();

		await section!.link(bob!);
		await section!.link(alice!);
		await section!.link(charlie!);

		expect((await alice!.getDynamics()).length).toBe(2);
		expect(section!.characters!.length).toBe(3);

		await bob!.delete();

		expect((await alice!.getDynamics()).length).toBe(1);

		section = await db.sections.get(sectionID);
		expect(section!.characters!.length).toBe(2);

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
