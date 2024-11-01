import { describe, it, expect, beforeAll, afterAll, vi, test, afterEach } from 'vitest';

import { addMomentAfter } from './api';
import { db, MOMENT_ORDER_STEP, MOMENT_MIN_ORDER_FRAC } from './db';

describe('Moment entities', () => {
	afterEach(async () => {
		await db.moments.clear();
	});

	it('Moment ordering', async () => {
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

	it('Moment links to other entities', async () => {
		let moment1 = await addMomentAfter('root', { name: 'Moment 1' });
		const moment2 = await addMomentAfter(moment1!, { name: 'Moment 2' });

		const location1Id = await db.locations.add({ name: 'Location 1' });
		moment1 = await moment1!.link((await db.locations.get(location1Id))!);

		expect((await moment1!.getLocations()).length).toBe(1);
		expect((await moment1!.getLocations())[0].name).toBe('Location 1');
		const location1 = await db.locations.get(location1Id);
		expect((await location1!.getMoments())[0].id).toBe(moment1!.id);
	});
});
