import { CharacterAttr, DynamicAttr, LocationAttr, MomentAttr, ThemeAttr } from '$lib/types/db';
import Dexie, { type EntityTable } from 'dexie';
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

class Moment {
	id!: string;
	order?: number;
	name?: string;
	body?: string;
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
		const rebalance = async () => {
			const moments = await db.moments.orderBy('order').toArray();
			const update = moments.map((m, i) => {
				const order = i * ORDER_STEP;
				return {
					key: m.id,
					changes: {
						order: order
					}
				};
			});
			await db.moments.bulkUpdate(update);
		};

		const getFrac = (num: number) => {
			return Math.min(num - Math.floor(num), Math.ceil(num) - num);
		};

		if (preceding === 'root') {
			const currRoot = await db.moments.where('order').equals(0).first();

			await db.moments.update(this.id, { order: 0 });
			this.order = 0;

			if (currRoot) {
				const afterRoot = await currRoot.getNext();
				if (afterRoot) {
					const currRootOrder = afterRoot.order! / 2;
					await db.moments.update(currRoot.id, { order: currRootOrder });
					currRoot.order = currRootOrder;
					const frac = getFrac(currRoot.order!);
					if (frac <= ORDER_MIN_FRAC && frac > 0) {
						await rebalance();
					}
				} else {
					await db.moments.update(currRoot.id, { order: ORDER_STEP });
					currRoot.order = ORDER_STEP;
				}
			}
		} else if (preceding === 'tail') {
			const currTail = await db.moments.orderBy('order').last();
			if (currTail) {
				const order = currTail.order! + ORDER_STEP;
				await db.moments.update(this.id, { order: order });
				this.order = order;
			} else {
				this.order = 0;
				await db.moments.update(this.id, { order: 0 });
			}
		} else {
			const next = await preceding.getNext();
			if (next) {
				const order = (next.order! + preceding.order!) / 2;
				await db.moments.update(this.id, { order: order });
				this.order = order;
				const frac = getFrac(order);
				if (frac <= ORDER_MIN_FRAC && frac > 0) {
					await rebalance();
				}
			} else {
				const order = preceding.order! + ORDER_STEP;
				await db.moments.update(this.id, { order: order });
				this.order = order;
			}
		}
		return this;
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
	if (!obj.order) {
		obj.orderAfter('tail');
	}
	// if (!obj.order) {
	// }
});

class Theme {
	id!: string;
	name?: string;
	desc?: string;
	attr?: ThemeAttr;

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
	attr?: LocationAttr;
	themes?: string[];

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
	if (!pk) {
		obj.id = ulid();
	}
});

class Character {
	id!: string;
	name?: string;
	attr?: CharacterAttr;
	locations?: string[];
	themes?: string[];

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
	aCharId!: string;
	bCharId!: string;
	attr?: DynamicAttr;
	themes?: string[];

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

export { db, ORDER_STEP, ORDER_MIN_FRAC };
export type { Location, Character, Dynamic, Moment, Theme };
