import Dexie, { type EntityTable, type PromiseExtended, liveQuery } from 'dexie';

const MOMENT_ORDER_STEP = 128;
const MOMENT_MIN_ORDER_FRAC = 0.00001;

/**
 * The main database for Sidekick
 */
const db = new Dexie('sidekick') as Dexie & {
	moments: EntityTable<Moment, 'id'>;
	locations: EntityTable<Location, 'id'>;
	characters: EntityTable<Character, 'id'>;
	character_relationships: EntityTable<CharacterRelationship, 'id'>;
	themes: EntityTable<Theme, 'id'>;
};

db.version(1).stores({
	moments: '++id, name, order, *locations, *characters, *themes',
	locations: '++id, name',
	characters: '++id, name',
	character_relationships: '++id, &[aCharId+bCharId], aCharId, bCharId',
	themes: '++id, name'
});

class Moment {
	id!: number;
	order?: number;
	name?: string;
	body?: string;
	attr?: string;
	locations?: number[];
	characters?: number[];
	themes?: number[];

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

	async link(other: Location | Character | Theme) {
		if (other instanceof Location) {
			const newLocations = [...(this.locations || []), other.id];
			await db.moments.update(this.id, { locations: newLocations });
			this.locations = newLocations;
		} else if (other instanceof Character) {
			const newCharacters = [...(this.characters || []), other.id];
			await db.moments.update(this.id, { characters: newCharacters });
			this.characters = newCharacters;
		} else if (other instanceof Theme) {
			const newThemes = [...(this.themes || []), other.id];
			await db.moments.update(this.id, { themes: newThemes });
			this.themes = newThemes;
		}

		return this;
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
			await db.moments.update(this.id, { characters: newCharacters });
			this.characters = newCharacters;
		} else if (other instanceof Theme) {
			const newThemes = (this.themes || []).filter((id) => id !== other.id);
			await db.moments.update(this.id, { themes: newThemes });
			this.themes = newThemes;
		}

		return this;
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
	 * @param preceding The preceding element, if undefined, insert this at root
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
	}

	async delete() {
		await db.moments.delete(this.id);
		this.id = -1;
	}
}

db.moments.mapToClass(Moment);

class Location {
	id!: number;
	name?: string;
	attr?: string;

	getMoments(): Promise<Moment[]> {
		return db.moments.where('locations').anyOf(this.id).toArray();
	}

	/**
	 * Remove this location from all moments
	 */
	async delete() {
		await db.moments.each((m) => {
			m.unlink(this);
		});
		await db.locations.delete(this.id);
		this.id = -1;
	}
}

db.locations.mapToClass(Location);

class Character {
	id!: number;
	name?: string;
	attr?: string;

	getRelationships(): Promise<CharacterRelationship[]> {
		return db.character_relationships.where('[aCharId+bCharId]').anyOf([this.id]).toArray();
	}

	async relatedCharacters(): Promise<Character[]> {
		const relationships = await this.getRelationships();
		const otherIds = relationships.map((r) => (r.aCharId === this.id ? r.bCharId : r.aCharId));
		return db.characters.where('id').anyOf(otherIds).toArray();
	}

	getMoments(): Promise<Moment[]> {
		return db.moments.where('characters').anyOf(this.id).toArray();
	}
}

db.characters.mapToClass(Character);

class CharacterRelationship {
	id!: number;
	aCharId!: number;
	bCharId!: number;
	attr?: string;

	getCharacters(): Promise<[Character | undefined, Character | undefined]> {
		return Promise.all([db.characters.get(this.aCharId), db.characters.get(this.bCharId)]);
	}
}

db.character_relationships.mapToClass(CharacterRelationship);

class Theme {
	id!: number;
	name?: string;
	attr?: string;
}

db.themes.mapToClass(Theme);

export { db, Moment, MOMENT_ORDER_STEP, MOMENT_MIN_ORDER_FRAC };
