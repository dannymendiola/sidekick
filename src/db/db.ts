import Dexie, { type EntityTable, type PromiseExtended } from 'dexie';

const MOMENT_ORDER_STEP = 1000;

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

	getLocations(targetDB = db): Promise<Location[]> {
		return targetDB.locations
			.where('id')
			.anyOf(this.locations || [])
			.toArray();
	}

	getNext(targetDB = db): Promise<Moment | undefined> {
		const subsequentMoments = targetDB.moments
			.orderBy('order')
			.filter((m) => m.order! > this.order!);
		return subsequentMoments.first();
	}

	/**
	 * Set the order of the element from the given preceding element
	 *
	 * @param preceding The preceding element, if undefined, insert this at root
	 */
	async orderAfter(preceding: Moment | 'root' | 'tail', targetDB = db) {
		const rebalance = async () => {
			const moments = await targetDB.moments.orderBy('order').toArray();
			const update = moments.map((m, i) => {
				const order = i * MOMENT_ORDER_STEP;
				return {
					key: m.id,
					changes: {
						order: order
					}
				};
			});
			await targetDB.moments.bulkUpdate(update);
		};

		if (preceding === 'root') {
			const currRoot = await targetDB.moments.where('order').equals(0).first();

			await targetDB.moments.update(this.id, { order: 0 });
			this.order = 0;

			if (currRoot) {
				const afterRoot = await currRoot.getNext(targetDB);
				if (afterRoot) {
					const currRootOrder = afterRoot.order! / 2;
					await targetDB.moments.update(currRoot.id, { order: currRootOrder });
					currRoot.order = currRootOrder;
					const frac = currRoot.order - Math.floor(currRoot.order);
					if (frac <= 0.001 && frac > 0) {
						await rebalance();
					}
				} else {
					await targetDB.moments.update(currRoot.id, { order: MOMENT_ORDER_STEP });
					currRoot.order = MOMENT_ORDER_STEP;
				}
			}
		} else if (preceding === 'tail') {
			const currTail = await targetDB.moments.orderBy('order').last();
			if (currTail) {
				const order = currTail.order! + MOMENT_ORDER_STEP;
				await targetDB.moments.update(this.id, { order: order });
				this.order = order;
			} else {
				this.order = 0;
				await targetDB.moments.update(this.id, { order: 0 });
			}
		} else {
			const next = await preceding.getNext(targetDB);
			if (next) {
				const order = (next.order! + preceding.order!) / 2;
				await targetDB.moments.update(this.id, { order: order });
				this.order = order;
				const frac = order - Math.floor(order);
				if (frac <= 0.001 && frac > 0) {
					await rebalance();
				}
			} else {
				const order = preceding.order! + MOMENT_ORDER_STEP;
				await targetDB.moments.update(this.id, { order: order });
				this.order = order;
			}
		}
	}

	async delete(targetDB = db) {
		await targetDB.moments.delete(this.id);
	}
}

db.moments.mapToClass(Moment);

class Location {
	id!: number;
	name?: string;
	attr?: string;

	moments(targetDB = db): Promise<Moment[]> {
		return targetDB.moments.where('locations').anyOf(this.id).toArray();
	}
}

db.locations.mapToClass(Location);

class Character {
	id!: number;
	name?: string;
	attr?: string;

	relationships(targetDB = db): Promise<CharacterRelationship[]> {
		return targetDB.character_relationships.where('[aCharId+bCharId]').anyOf([this.id]).toArray();
	}

	async relatedCharacters(): Promise<Character[]> {
		const relationships = await this.relationships();
		const otherIds = relationships.map((r) => (r.aCharId === this.id ? r.bCharId : r.aCharId));
		return db.characters.where('id').anyOf(otherIds).toArray();
	}
}

db.characters.mapToClass(Character);

class CharacterRelationship {
	id!: number;
	aCharId!: number;
	bCharId!: number;
	attr?: string;

	characters(): Promise<[Character | undefined, Character | undefined]> {
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

export { db, MOMENT_ORDER_STEP, Moment, Location, Character, CharacterRelationship, Theme };
