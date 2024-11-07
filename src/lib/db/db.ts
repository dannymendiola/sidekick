import { CharacterAttr, DynamicAttr, LocationAttr, MomentAttr } from '$lib/types/db';
import Dexie, { type EntityTable } from 'dexie';
import { ulid } from 'ulidx';

const MOMENT_ORDER_STEP = 128;
const MOMENT_MIN_ORDER_FRAC = 0.00001;

/**
 * The main database for Sidekick
 */
const db = new Dexie('sidekick') as Dexie & {
	moments: EntityTable<Moment, 'id'>;
	locations: EntityTable<Location, 'id'>;
	characters: EntityTable<Character, 'id'>;
	dynamics: EntityTable<Dynamic, 'id'>;
};

db.version(1).stores({
	moments: 'id, name, order, *locations, *characters, *themes',
	locations: 'id, name',
	characters: 'id, name',
	dynamics: 'id, &[aCharId+bCharId], aCharId, bCharId'
});

class Moment {
	id!: string;
	order?: number;
	name?: string;
	body?: string;
	attr?: string;
	locations?: string[];
	characters?: string[];

	async getLocations(): Promise<Location[]> {
		return await db.locations
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

	/**
	 * Link this Moment to a story element
	 *
	 * @param other a Location, Character, or Theme
	 */
	async link(other: Location | Character) {
		if (other instanceof Location) {
			const newLocations = [...new Set([...(this.locations || []), other.id])];
			await db.moments.update(this.id, { locations: newLocations });
			this.locations = newLocations;
		} else if (other instanceof Character) {
			const newCharacters = [...new Set([...(this.characters || []), other.id])];
			await db.moments.update(this.id, { characters: newCharacters });
			this.characters = newCharacters;
		}
	}

	/**
	 * Unlinks the given element from this Moment, if it's linked
	 *
	 * @param other Location, Character, or Theme
	 */
	async unlink(other: Location | Character) {
		if (other instanceof Location) {
			const newLocations = (this.locations || []).filter((id) => id !== other.id);
			await db.moments.update(this.id, { locations: newLocations });
			this.locations = newLocations;
		} else if (other instanceof Character) {
			const newCharacters = (this.characters || []).filter((id) => id !== other.id);
			this.characters = newCharacters;
			await db.moments.update(this.id, { characters: newCharacters });
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
				const order = i * MOMENT_ORDER_STEP;
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
					if (frac <= MOMENT_MIN_ORDER_FRAC && frac > 0) {
						await rebalance();
					}
				} else {
					await db.moments.update(currRoot.id, { order: MOMENT_ORDER_STEP });
					currRoot.order = MOMENT_ORDER_STEP;
				}
			}
		} else if (preceding === 'tail') {
			const currTail = await db.moments.orderBy('order').last();
			if (currTail) {
				const order = currTail.order! + MOMENT_ORDER_STEP;
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
				if (frac <= MOMENT_MIN_ORDER_FRAC && frac > 0) {
					await rebalance();
				}
			} else {
				const order = preceding.order! + MOMENT_ORDER_STEP;
				await db.moments.update(this.id, { order: order });
				this.order = order;
			}
		}
		return this;
	}

	getAttr() {
		return JSON.parse(this.attr || '{}') as MomentAttr;
	}

	async updateAttr(attr: MomentAttr) {
		const currAttr = JSON.parse(this.attr || '{}');
		const newAttr = { ...currAttr, ...attr };
		this.attr = JSON.stringify(newAttr);
		await db.moments.update(this.id, { attr: this.attr });
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

class Location {
	id!: string;
	name?: string;
	attr?: string;

	getMoments(): Promise<Moment[]> {
		return db.moments.where('locations').anyOf(this.id).toArray();
	}

	getAttr() {
		return JSON.parse(this.attr || '{}') as LocationAttr;
	}

	async updateAttr(attr: LocationAttr) {
		const currAttr = JSON.parse(this.attr || '{}');
		const newAttr = { ...currAttr, ...attr };
		this.attr = JSON.stringify(newAttr);
		await db.locations.update(this.id, { attr: this.attr });
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
	attr?: string;

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

	getAttr() {
		return JSON.parse(this.attr || '{}') as CharacterAttr;
	}

	async updateAttr(attr: CharacterAttr) {
		const currAttr = JSON.parse(this.attr || '{}');
		const newAttr = { ...currAttr, ...attr };
		this.attr = JSON.stringify(newAttr);
		await db.characters.update(this.id, { attr: this.attr });
	}

	async delete() {
		// const moments = await db.moments.where('characters').anyOf(this.id).toArray();
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
	attr?: string;

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

	getAttr() {
		return JSON.parse(this.attr || '{}') as DynamicAttr;
	}

	async updateAttr(attr: DynamicAttr) {
		let currAttr = JSON.parse(this.attr || '{}');
		let newAttr = { ...currAttr, ...attr };
		this.attr = JSON.stringify(newAttr);
		await db.dynamics.update(this.id, { attr: this.attr });
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

export { db, MOMENT_ORDER_STEP, MOMENT_MIN_ORDER_FRAC };
export type { Location, Character, Dynamic, Moment };
