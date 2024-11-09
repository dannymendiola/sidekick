import { CharacterAttr, DynamicAttr, LocationAttr, MomentAttr, ThemeAttr } from '$lib/types/db';
import Dexie, { type EntityTable } from 'dexie';
import { Delta } from 'quill/core';
import { ulid } from 'ulidx';

const ORDER_STEP = 128;
const ORDER_MIN_FRAC = 0.00001;

/**
 * The main database for Sidekick
 */
const db = new Dexie('sidekick') as Dexie & {
	moments: EntityTable<Moment, 'id'>;
	themes: EntityTable<Theme, 'id'>;
	locations: EntityTable<Location, 'id'>;
	characters: EntityTable<Character, 'id'>;
	dynamics: EntityTable<Dynamic, 'id'>;
};

db.version(1).stores({
	moments: 'id, name, order, *locations, *characters, *themes',
	themes: 'id, name, order',
	locations: 'id, name, order, *themes',
	characters: 'id, name, order, *locations, *themes',
	dynamics: 'id, order, &[aCharId+bCharId], aCharId, bCharId, *themes'
});

type Entity = Moment | Theme | Location | Character | Dynamic;

const orderAfter = async <T extends Entity>(
	elem: T,
	preceding: T | 'root' | 'tail',
	table: EntityTable<T, 'id'>
) => {
	// TODO get rid of these ts-ignores if possible
	const rebalance = async () => {
		const elements = await table.orderBy('order').toArray();
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
	}

	return elem;
};

class Moment {
	id!: string;
	order?: number;
	name?: string;
	body?: Delta;
	attr?: MomentAttr;
	locations?: string[];
	characters?: string[];
	themes?: string[];

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

	getThemes(): Promise<Theme[]> {
		return db.themes
			.where('id')
			.anyOf(this.themes || [])
			.toArray();
	}

	refresh(): Promise<Moment> {
		return db.moments.get(this.id) as Promise<Moment>;
	}

	/**
	 * Link this Moment to a story element
	 *
	 * @param other a Location, Character, or Theme
	 */
	async link(other: Location | Character | Theme) {
		if (other instanceof Location) {
			const newLocations = [...new Set([...(this.locations || []), other.id])];
			await db.moments.update(this.id, { locations: newLocations });
			this.locations = newLocations;
		} else if (other instanceof Character) {
			const newCharacters = [...new Set([...(this.characters || []), other.id])];
			await db.moments.update(this.id, { characters: newCharacters });
			this.characters = newCharacters;
		} else if (other instanceof Theme) {
			const newThemes = [...new Set([...(this.themes || []), other.id])];
			await db.moments.update(this.id, { themes: newThemes });
			this.themes = newThemes;
		}
	}

	/**
	 * Unlinks the given element from this Moment, if it's linked
	 *
	 * @param other Location, Character, or Theme
	 */
	async unlink(other: Location | Character | Theme) {
		if (other instanceof Location) {
			const newLocations = (this.locations || []).filter((id) => id !== other.id);
			await db.moments.update(this.id, { locations: newLocations });
			this.locations = newLocations;
		} else if (other instanceof Character) {
			const newCharacters = (this.characters || []).filter((id) => id !== other.id);
			this.characters = newCharacters;
			await db.moments.update(this.id, { characters: newCharacters });
		} else if (other instanceof Theme) {
			const newThemes = (this.themes || []).filter((id) => id !== other.id);
			await db.moments.update(this.id, { themes: newThemes });
			this.themes = newThemes;
		}
	}

	getNext(): Promise<Moment | undefined> {
		const subsequentMoments = db.moments.orderBy('order').filter((m) => m.order! > this.order!);
		return subsequentMoments.first();
	}

	getPrev(): Promise<Moment | undefined> {
		const precedingMoments = db.moments.orderBy('order').filter((m) => m.order! < this.order!);
		return precedingMoments.last();
	}

	/**
	 * Set the order of the element from the given preceding element
	 *
	 * @param preceding The preceding element, or 'root' or 'tail'
	 */
	async orderAfter(preceding: Moment | 'root' | 'tail') {
		return orderAfter(this, preceding, db.moments);
	}

	// use a partial just in case the interface ever gets a field that isn't optional
	async updateAttr(attr: Partial<MomentAttr>) {
		const currAttr = this.attr || {};
		const newAttr = { ...currAttr, ...attr };
		this.attr = newAttr;
		await db.moments.update(this.id, { attr: newAttr as MomentAttr });
	}

	async delete() {
		const id = this.id;
		this.id = '';
		await db.moments.delete(id);
	}
}

db.moments.mapToClass(Moment);
db.moments.hook('creating', (pk, obj, _) => {
	if (!pk) {
		obj.id = ulid();
	}
});

class Theme {
	id!: string;
	name?: string;
	order?: number;
	desc?: string;
	attr?: ThemeAttr;

	orderAfter(preceding: Theme | 'root' | 'tail'): Promise<Theme> {
		return orderAfter(this, preceding, db.themes);
	}

	async getNext(): Promise<Theme | undefined> {
		const curr = await this.refresh();
		const themesAfter = db.themes.orderBy('order').filter((m) => m.order! > this.order!);
		return themesAfter.first();
	}

	async getPrev(): Promise<Theme | undefined> {
		const curr = await this.refresh();
		const themesBefore = db.themes.orderBy('order').filter((m) => m.order! < curr.order!);
		return themesBefore.last();
	}

	getMoments(): Promise<Moment[]> {
		return db.moments.where('themes').anyOf(this.id).sortBy('order');
	}

	getLocations(): Promise<Location[]> {
		return db.locations.where('themes').anyOf(this.id).toArray();
	}

	getCharacters(): Promise<Character[]> {
		return db.characters.where('themes').anyOf(this.id).toArray();
	}

	getDynamics(): Promise<Dynamic[]> {
		return db.dynamics.where('themes').anyOf(this.id).toArray();
	}

	async updateAttr(attr: Partial<ThemeAttr>) {
		const currAttr = this.attr || {};
		const newAttr = { ...currAttr, ...attr };
		this.attr = newAttr;
		await db.themes.update(this.id, { attr: this.attr });
	}

	refresh(): Promise<Theme> {
		return db.themes.get(this.id) as Promise<Theme>;
	}

	async delete() {
		await Promise.all([
			db.moments
				.where('themes')
				.anyOf(this.id)
				.each((m) => m.unlink(this)),
			db.locations
				.where('themes')
				.anyOf(this.id)
				.each((l) => l.removeTheme(this)),
			db.characters
				.where('themes')
				.anyOf(this.id)
				.each((c) => c.removeTheme(this)),
			db.dynamics
				.where('themes')
				.anyOf(this.id)
				.each((d) => d.removeTheme(this))
		]);
		await db.themes.delete(this.id);
		this.id = '';
	}
}

db.themes.mapToClass(Theme);
db.themes.hook('creating', (pk, obj, _) => {
	if (!pk) {
		obj.id = ulid();
	}
});

class Location {
	id!: string;
	name?: string;
	order?: number;
	attr?: LocationAttr;
	themes?: string[];

	orderAfter(preceding: Location | 'root' | 'tail'): Promise<Location> {
		return orderAfter(this, preceding, db.locations);
	}

	getNext(): Promise<Location | undefined> {
		const locsAfter = db.locations.orderBy('order').filter((m) => m.order! > this.order!);
		return locsAfter.first();
	}

	getPrev(): Promise<Location | undefined> {
		const locsBefore = db.locations.orderBy('order').filter((m) => m.order! < this.order!);
		return locsBefore.last();
	}

	getMoments(): Promise<Moment[]> {
		return db.moments.where('locations').anyOf(this.id).toArray();
	}

	getThemes(): Promise<Theme[]> {
		return db.themes
			.where('id')
			.anyOf(this.themes || [])
			.toArray();
	}

	async addTheme(theme: Theme) {
		const newThemes = [...new Set([...(this.themes || []), theme.id])];
		this.themes = newThemes;
		await db.locations.update(this.id, { themes: newThemes });
	}

	async removeTheme(theme: Theme) {
		const newThemes = (this.themes || []).filter((t) => t !== theme.id);
		this.themes = newThemes;
		await db.locations.update(this.id, { themes: newThemes });
	}

	async updateAttr(attr: Partial<LocationAttr>) {
		const currAttr = this.attr || {};
		const newAttr = { ...currAttr, ...attr };
		this.attr = newAttr;
		await db.locations.update(this.id, { attr: this.attr });
	}

	refresh(): Promise<Location> {
		return db.locations.get(this.id) as Promise<Location>;
	}

	/**
	 * Remove this location from all moments and then from the db
	 */
	async delete() {
		await db.moments.each((m) => {
			m.unlink(this);
		});
		await db.locations.delete(this.id);
		this.id = '';
	}
}

db.locations.mapToClass(Location);
db.locations.hook('creating', (pk, obj, _) => {
	obj.id = pk || ulid();
});

class Character {
	id!: string;
	name?: string;
	order?: number;
	attr?: CharacterAttr;
	locations?: string[];
	themes?: string[];

	orderAfter(preceding: Character | 'root' | 'tail'): Promise<Character> {
		return orderAfter(this, preceding, db.characters);
	}

	getNext(): Promise<Character | undefined> {
		const charsAfter = db.characters.orderBy('order').filter((m) => m.order! > this.order!);
		return charsAfter.first();
	}

	getPrev(): Promise<Character | undefined> {
		const charsBefore = db.characters.orderBy('order').filter((m) => m.order! < this.order!);
		return charsBefore.last();
	}

	getDynamics(): Promise<Dynamic[]> {
		return db.dynamics.where('aCharId').equals(this.id).or('bCharId').equals(this.id).toArray();
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

	getMoments(): Promise<Moment[]> {
		return db.moments.where('characters').anyOf(this.id).toArray();
	}

	async createDynamic(otherId: string) {
		if (this.id === otherId) return undefined;

		const [idA, idB] = this.id < otherId ? [this.id, otherId] : [otherId, this.id];

		const existing = await db.dynamics.where('[aCharId+bCharId]').equals([idA, idB]).first();
		if (existing) return existing;

		const dynamicId = await db.dynamics.add({ aCharId: idA, bCharId: idB });

		return db.dynamics.get(dynamicId);
	}

	async removeDynamic(otherId: string) {
		const [idA, idB] = this.id < otherId ? [this.id, otherId] : [otherId, this.id];
		const dynamic = await db.dynamics.where('[aCharId+bCharId]').equals([idA, idB]).first();

		if (dynamic) await dynamic.delete();
	}

	getThemes(): Promise<Theme[]> {
		return db.themes
			.where('id')
			.anyOf(this.themes || [])
			.toArray();
	}

	async addTheme(theme: Theme) {
		const newThemes = [...new Set([...(this.themes || []), theme.id])];
		this.themes = newThemes;
		await db.characters.update(this.id, { themes: newThemes });
	}

	async removeTheme(theme: Theme) {
		const newThemes = (this.themes || []).filter((t) => t !== theme.id);
		this.themes = newThemes;
		await db.characters.update(this.id, { themes: newThemes });
	}

	async updateAttr(attr: CharacterAttr) {
		const currAttr = this.attr || {};
		const newAttr = { ...currAttr, ...attr };
		this.attr = newAttr;
		await db.characters.update(this.id, { attr: this.attr });
	}

	refresh(): Promise<Character> {
		return db.characters.get(this.id) as Promise<Character>;
	}

	async delete() {
		await Promise.all((await db.moments.toArray()).map((m) => m.unlink(this)));
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
});

class Dynamic {
	id!: string;
	order?: number;
	aCharId!: string;
	bCharId!: string;
	attr?: DynamicAttr;
	themes?: string[];

	orderAfter(preceding: Dynamic | 'root' | 'tail') {
		return orderAfter(this, preceding, db.dynamics);
	}

	getNext(): Promise<Dynamic | undefined> {
		const dynsAfter = db.dynamics.orderBy('order').filter((m) => m.order! > this.order!);
		return dynsAfter.first();
	}

	getPrev(): Promise<Dynamic | undefined> {
		const dynsBefore = db.dynamics.orderBy('order').filter((m) => m.order! < this.order!);
		return dynsBefore.last();
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

	getThemes(): Promise<Theme[]> {
		return db.themes
			.where('id')
			.anyOf(this.themes || [])
			.toArray();
	}

	async addTheme(theme: Theme) {
		const newThemes = [...new Set([...(this.themes || []), theme.id])];
		this.themes = newThemes;
		await db.dynamics.update(this.id, { themes: newThemes });
	}

	async removeTheme(theme: Theme) {
		const newThemes = (this.themes || []).filter((t) => t !== theme.id);
		this.themes = newThemes;
		await db.dynamics.update(this.id, { themes: newThemes });
	}

	async updateAttr(attr: Partial<DynamicAttr>) {
		let currAttr = this.attr || {};
		let newAttr = { ...currAttr, ...attr };
		this.attr = newAttr;
		await db.dynamics.update(this.id, { attr: this.attr });
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
});

// export async function addAfter<T extends Entity>(after: T | 'root' | 'tail', elem: T): Promise<T | undefined> {
//     if (elem instanceof Character && after instanceof Character) {
//         const id = await db.characters.add(elem);
//         const character = await db.characters.get(id);
//         return character ? await character.orderAfter(after) as T : undefined;
//     } else if (elem instanceof Dynamic && after instanceof Dynamic) {
//         const id = await db.dynamics.add(elem);
//         const dynamic = await db.dynamics.get(id);
//         return dynamic ? await dynamic.orderAfter(after) as T : undefined;
//     } else if (elem instanceof Moment && after instanceof Moment) {
//         const id = await db.moments.add(elem);
//         const moment = await db.moments.get(id);
//         return moment ? await moment.orderAfter(after) as T : undefined;
//     } else if (elem instanceof Location && after instanceof Location) {
//         const id = await db.locations.add(elem);
//         const location = await db.locations.get(id);
//         return location ? await location.orderAfter(after) as T : undefined;
//     } else if (elem instanceof Theme && after instanceof Theme) {
//         const id = await db.themes.add(elem);
//         const theme = await db.themes.get(id);
//         return theme ? await theme.orderAfter(after) as T : undefined;
//     }
//     return undefined;
// }

export { db, ORDER_STEP, ORDER_MIN_FRAC };
export type { Location, Character, Dynamic, Moment, Theme };
