import { CharacterAttr, DynamicAttr, LocationAttr, SectionAttr } from '$lib/types/db';
import Dexie, { type EntityTable } from 'dexie';
// import { Delta } from 'quill/core';
import { ulid } from 'ulidx';
import { addDynamicAfter } from './api';
import { skstate } from '$lib';

const ORDER_STEP = 128;
const ORDER_MIN_FRAC = 0.00001;

/**
 * The main database for Sidekick
 */
const db = new Dexie('sidekick') as Dexie & {
	projects: EntityTable<Project, 'id'>;
	sections: EntityTable<Section, 'id'>;
	locations: EntityTable<Location, 'id'>;
	characters: EntityTable<Character, 'id'>;
	dynamics: EntityTable<Dynamic, 'id'>;
};

db.version(1).stores({
	projects: 'id, name, openedAt',
	// sections: 'id, name, order, *locations, *characters',
	sections: 'id, name, order, project, *locations, *characters',
	locations: 'id, name, order, project',
	// characters: 'id, name, order, *locations',
	characters: 'id, name, order, project, *locations',
	dynamics: 'id, order, project, &[aCharId+bCharId], aCharId, bCharId'
});

type Entity = Section | Location | Character | Dynamic;

const orderAfter = async <T extends Entity>(
	elem: T,
	preceding: T | 'root' | 'tail',
	table: EntityTable<T, 'id'>
) => {
	// TODO get rid of these ts-ignores if possible
	const rebalance = async () => {
		// const elements = await table.orderBy('order').toArray();
		const elements = await table
			.where('project')
			.equals(skstate.projectID || '')
			.sortBy('order');
		const update = elements.map((m, i) => {
			const order = i * ORDER_STEP;
			return {
				key: m.id,
				changes: {
					order: order
				}
			};
		});
		// @ts-ignore
		await table.bulkUpdate(update);
	};

	const getFrac = (num: number) => {
		return Math.min(num - Math.floor(num), Math.ceil(num) - num);
	};

	if (preceding === 'root') {
		const currRoot = await table.where('order').equals(0).first();
		// @ts-ignore
		await table.update(elem.id, { order: 0 });
		elem.order = 0;

		if (currRoot) {
			const afterRoot = await currRoot.getNext();
			if (afterRoot) {
				const currRootOrder = afterRoot.order! / 2;
				// @ts-ignore
				await table.update(currRoot.id, { order: currRootOrder });
				currRoot.order = currRootOrder;
				const frac = getFrac(currRoot.order!);
				if (frac <= ORDER_MIN_FRAC && frac > 0) {
					await rebalance();
				}
			} else {
				// @ts-ignore
				await table.update(currRoot.id, { order: ORDER_STEP });
				currRoot.order = ORDER_STEP;
			}
		}
	}
	// @ts-ignore
	else if (preceding === 'tail') {
		const currTail = await table.orderBy('order').last();
		if (currTail) {
			const order = currTail.order! + ORDER_STEP;
			// @ts-ignore
			await table.update(elem.id, { order: order });
			elem.order = order;
		} else {
			elem.order = 0;
			// @ts-ignore
			await table.update(elem.id, { order: 0 });
		}
	} else {
		// ensure that head is always at 0, so that we always retain the ordering space <root.order>..<root.next.order>
		const forceRebalance = elem.order === 0;

		const next = await preceding.getNext();
		if (next) {
			const order = (next.order! + preceding.order!) / 2;
			// @ts-ignore
			await table.update(elem.id, { order: order });
			elem.order = order;
			const frac = getFrac(order);
			if (frac <= ORDER_MIN_FRAC && frac > 0) {
				await rebalance();
			}
		} else {
			const order = preceding.order! + ORDER_STEP;
			// @ts-ignore
			await table.update(elem.id, { order: order });
			elem.order = order;
		}
		if (forceRebalance) await rebalance();
	}

	return elem;
};

export class Project {
	id!: string;
	name?: string;
	createdAt?: number;
	openedAt?: number;
	attr?: {}; // Unused for now
}

db.projects.mapToClass(Project);
db.projects.hook('creating', (pk, obj, _) => {
	if (!pk) {
		obj.id = ulid();
	}
	obj.createdAt = Date.now();
	obj.openedAt = Date.now();
});

export class Section {
	id!: string;
	project?: string;
	order?: number;
	name?: string;
	body?: string;
	attr?: SectionAttr;
	locations?: string[];
	characters?: string[];
	previewCollapsed?: boolean;

	/**
	 * Set the order of the element from the given preceding element
	 *
	 * @param preceding The preceding element, or 'root' or 'tail'
	 */
	async orderAfter(preceding: Section | 'root' | 'tail') {
		return orderAfter(this, preceding, db.sections);
	}

	async getNext(): Promise<Section | undefined> {
		const curr = await this.refresh();
		const subsequentSections = db.sections.orderBy('order').filter((m) => m.order! > curr.order!);
		return subsequentSections.first();
	}

	async getPrev(): Promise<Section | undefined> {
		const curr = await this.refresh();
		const precedingSections = db.sections.orderBy('order').filter((m) => m.order! < curr.order!);
		return precedingSections.last();
	}

	getLocations(): Promise<Location[]> {
		return db.locations
			.where('id')
			.anyOf(this.locations || [])
			.sortBy('name');
	}

	getCharacters(): Promise<Character[]> {
		return db.characters
			.where('id')
			.anyOf(this.characters || [])
			.toArray();
	}

	refresh(): Promise<Section> {
		return db.sections.get(this.id) as Promise<Section>;
	}

	/**
	 * Link this Section to a story element
	 *
	 * @param other a Location, Character, or Theme
	 */
	async link(other: Location | Character) {
		if (other instanceof Location) {
			const newLocations = [...new Set([...(this.locations || []), other.id])];
			await db.sections.update(this.id, { locations: newLocations });
			this.locations = newLocations;
		} else if (other instanceof Character) {
			const newCharacters = [...new Set([...(this.characters || []), other.id])];
			await db.sections.update(this.id, { characters: newCharacters });
			this.characters = newCharacters;
		}
	}

	/**
	 * Unlinks the given element from this Section, if it's linked
	 *
	 * @param other Location, Character, or Theme
	 */
	async unlink(other: Location | Character) {
		if (other instanceof Location) {
			const newLocations = (this.locations || []).filter((id) => id !== other.id);
			await db.sections.update(this.id, { locations: newLocations });
			this.locations = newLocations;
		} else if (other instanceof Character) {
			const newCharacters = (this.characters || []).filter((id) => id !== other.id);
			this.characters = newCharacters;
			await db.sections.update(this.id, { characters: newCharacters });
		}
	}

	// use a partial just in case the interface ever gets a field that isn't optional
	async updateAttr(attr: Partial<SectionAttr>) {
		const currAttr = this.attr || {};
		const newAttr = { ...currAttr, ...attr };
		this.attr = newAttr;
		await db.sections.update(this.id, { attr: newAttr as SectionAttr });
	}

	async cleanAttr() {
		const newAttr = Object.fromEntries(
			Object.entries(this.attr || {}).filter(([_, v]) => {
				// if ((v as Delta).ops) {
				// 	return (v as Delta).ops.some((op) => op.insert !== '' && op.insert !== '\n');
				// }

				return v?.trim() !== '';
			})
		);
		this.attr = newAttr;
		await db.sections.update(this.id, { attr: newAttr });
	}

	async delete() {
		const id = this.id;
		this.id = '';
		await db.sections.delete(id);
	}
}

db.sections.mapToClass(Section);
db.sections.hook('creating', (pk, obj, _) => {
	if (!pk) {
		obj.id = ulid();
	}
	if (!obj.project) {
		obj.project = skstate.projectID;
	}
});

export class Location {
	id!: string;
	project?: string;
	order?: number;
	name?: string;
	body?: string;
	attr?: LocationAttr;
	previewCollapsed?: boolean;

	orderAfter(preceding: Location | 'root' | 'tail'): Promise<Location> {
		return orderAfter(this, preceding, db.locations);
	}

	async getNext(): Promise<Location | undefined> {
		const curr = await this.refresh();
		const locsAfter = db.locations.orderBy('order').filter((m) => m.order! > curr.order!);
		return locsAfter.first();
	}

	async getPrev(): Promise<Location | undefined> {
		const curr = await this.refresh();
		const locsBefore = db.locations.orderBy('order').filter((m) => m.order! < curr.order!);
		return locsBefore.last();
	}

	getSections(): Promise<Section[]> {
		return db.sections.where('locations').anyOf(this.id).toArray();
	}

	getCharacters(): Promise<Character[]> {
		return db.characters.where('locations').anyOf(this.id).toArray();
	}

	async updateAttr(attr: Partial<LocationAttr>) {
		const currAttr = this.attr || {};
		const newAttr = { ...currAttr, ...attr };
		this.attr = newAttr;
		await db.locations.update(this.id, { attr: this.attr });
	}

	async cleanAttr() {
		const newAttr = Object.fromEntries(
			Object.entries(this.attr || {}).filter(([_, v]) => {
				// if ((v as Delta).ops) {
				// 	return (v as Delta).ops.some((op) => op.insert !== '' && op.insert !== '\n');
				// }
				return v?.trim() !== '';
			})
		);
		this.attr = newAttr;
		await db.locations.update(this.id, { attr: newAttr });
	}

	refresh(): Promise<Location> {
		return db.locations.get(this.id) as Promise<Location>;
	}

	/**
	 * Remove this location from all Sections and then from the db
	 */
	async delete() {
		await db.sections.each((s) => {
			s.unlink(this);
		});
		await db.locations.delete(this.id);
		this.id = '';
	}
}

db.locations.mapToClass(Location);
db.locations.hook('creating', (pk, obj, _) => {
	obj.id = pk || ulid();
	if (!obj.project) {
		obj.project = skstate.projectID;
	}
});

export class Character {
	id!: string;
	project?: string;
	name?: string;
	body?: string;
	order?: number;
	attr?: CharacterAttr;
	locations?: string[];
	previewCollapsed?: boolean;

	orderAfter(preceding: Character | 'root' | 'tail'): Promise<Character> {
		return orderAfter(this, preceding, db.characters);
	}

	async getNext(): Promise<Character | undefined> {
		const curr = await this.refresh();
		const charsAfter = db.characters.orderBy('order').filter((m) => m.order! > curr.order!);
		return charsAfter.first();
	}

	async getPrev(): Promise<Character | undefined> {
		const curr = await this.refresh();
		const charsBefore = db.characters.orderBy('order').filter((m) => m.order! < curr.order!);
		return charsBefore.last();
	}

	addLocation(locId: string) {
		this.locations = this.locations || [];
		this.locations = [...new Set(this.locations).add(locId)];
		db.characters.update(this.id, { locations: this.locations });
	}

	getLocations(): Promise<Location[]> {
		return db.locations
			.where('id')
			.anyOf(this.locations || [])
			.toArray();
	}

	getDynamics(): Promise<Dynamic[]> {
		return db.dynamics.where('aCharId').equals(this.id).or('bCharId').equals(this.id).toArray();
	}

	getSections(): Promise<Section[]> {
		return db.sections.where('characters').anyOf(this.id).toArray();
	}

	async relatedCharacters(): Promise<Character[]> {
		const dynamics = await this.getDynamics();
		const otherIds = dynamics.map((d) => (d.aCharId === this.id ? d.bCharId : d.aCharId));
		return db.characters.where('id').anyOf(otherIds).toArray();
	}

	async getDynamicWith(otherId: string) {
		if (this.id === otherId) return;
		const [aId, bId] = this.id < otherId ? [this.id, otherId] : [otherId, this.id];
		return await db.dynamics.where('[aCharId+bCharId]').equals([aId, bId]).first();
	}

	async createDynamic(otherId: string) {
		if (this.id === otherId) return undefined;

		const [idA, idB] = this.id < otherId ? [this.id, otherId] : [otherId, this.id];

		const existing = await db.dynamics.where('[aCharId+bCharId]').equals([idA, idB]).first();
		if (existing) return existing;

		return await addDynamicAfter('root', { aCharId: idA, bCharId: idB });
	}

	async removeDynamic(otherId: string) {
		const [idA, idB] = this.id < otherId ? [this.id, otherId] : [otherId, this.id];
		const dynamic = await db.dynamics.where('[aCharId+bCharId]').equals([idA, idB]).first();

		if (dynamic) await dynamic.delete();
	}

	async updateAttr(attr: CharacterAttr) {
		const currAttr = this.attr || {};
		const newAttr = { ...currAttr, ...attr };
		this.attr = newAttr;
		await db.characters.update(this.id, { attr: this.attr });
	}

	async cleanAttr() {
		const newAttr = Object.fromEntries(
			Object.entries(this.attr || {}).filter(([_, v]) => {
				// if ((v as Delta).ops) {
				// 	return (v as Delta).ops?.some((op) => op.insert !== '' && op.insert !== '\n');
				// }

				return v?.trim() !== '';
			})
		);
		this.attr = newAttr;
		await db.characters.update(this.id, { attr: newAttr });
	}

	refresh(): Promise<Character> {
		return db.characters.get(this.id) as Promise<Character>;
	}

	async delete() {
		await Promise.all((await db.sections.toArray()).map((m) => m.unlink(this)));
		const dynamics = await this.getDynamics();
		await Promise.all(dynamics.map((d) => d.delete()));
		await db.characters.delete(this.id);
		this.id = '';
	}
}

db.characters.mapToClass(Character);
db.characters.hook('creating', (pk, obj, _) => {
	if (!pk) {
		obj.id = ulid();
	}
	if (!obj.project) {
		obj.project = skstate.projectID;
	}
});

export class Dynamic {
	id!: string;
	project?: string;
	order?: number;
	aCharId!: string;
	bCharId!: string;
	name: string = '';
	body?: string;
	attr?: DynamicAttr;
	previewCollapsed?: boolean;

	orderAfter(preceding: Dynamic | 'root' | 'tail') {
		return orderAfter(this, preceding, db.dynamics);
	}

	async getNext(): Promise<Dynamic | undefined> {
		const curr = await this.refresh();
		const dynsAfter = db.dynamics.orderBy('order').filter((m) => m.order! > curr.order!);
		return dynsAfter.first();
	}

	async getPrev(): Promise<Dynamic | undefined> {
		const curr = await this.refresh();
		const dynsBefore = db.dynamics.orderBy('order').filter((m) => m.order! < curr.order!);
		return dynsBefore.last();
	}

	async toString() {
		const [a, b] = [this.aCharId, this.bCharId].map((id) => db.characters.get(id));
		return await Promise.all([a, b]).then(([a, b]) => `${a?.name} & ${b?.name}`);
	}

	getCharacters(): Promise<[Character | undefined, Character | undefined]> {
		return Promise.all([db.characters.get(this.aCharId), db.characters.get(this.bCharId)]);
	}

	async getOther(fromCharId: string) {
		if (fromCharId === this.aCharId) {
			return db.characters.get(this.bCharId);
		} else if (fromCharId === this.bCharId) {
			return db.characters.get(this.aCharId);
		}
		return undefined;
	}

	async updateAttr(attr: Partial<DynamicAttr>) {
		let currAttr = this.attr || {};
		let newAttr = { ...currAttr, ...attr };
		this.attr = newAttr;
		await db.dynamics.update(this.id, { attr: this.attr });
	}

	async cleanAttr() {
		const newAttr = Object.fromEntries(
			Object.entries(this.attr || {}).filter(([_, v]) => {
				// if ((v as Delta).ops) {
				// 	return (v as Delta).ops.some((op) => op.insert !== '' && op.insert !== '\n');
				// }

				return v?.trim() !== '';
			})
		);
		this.attr = newAttr;
		await db.dynamics.update(this.id, { attr: newAttr });
	}

	refresh(): Promise<Dynamic> {
		return db.dynamics.get(this.id) as Promise<Dynamic>;
	}

	async delete() {
		await db.dynamics.delete(this.id);
		this.id = '';
	}
}

db.dynamics.mapToClass(Dynamic);
db.dynamics.hook('creating', (pk, obj, _) => {
	if (!pk) {
		obj.id = ulid();
	}
	if (!obj.project) {
		obj.project = skstate.projectID;
	}
});

export { db, ORDER_STEP, ORDER_MIN_FRAC };
