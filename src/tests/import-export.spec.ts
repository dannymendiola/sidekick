import { describe, it, expect, afterAll, afterEach } from 'vitest';
import { isValidProjectData } from '$lib';

describe('Import/Export', () => {
	const data = {
		valid: {
			projectID: '01JRR5MA0JHEM2F87KJHN17WJS',
			dbVersion: 1,
			creationDate: 1744567937043,
			exportDate: 1745304235738,
			projectName: 'The Summer Leaves',
			sections: [
				{
					name: 'Ghost therapy',
					id: '01JRR5QBWGG149KXS33YWN7W0A',
					project: '01JRR5MA0JHEM2F87KJHN17WJS',
					order: 128,
					body: '<p></p>'
				}
			],
			characters: [
				{
					name: 'Tony',
					id: '01JSE3R8BRBH31NK254R8CNCMY',
					project: '01JRR5MA0JHEM2F87KJHN17WJS',
					order: 0,
					body: '<p>Is a ghost</p>'
				}
			],
			characterDynamics: [],
			locations: [
				{
					name: 'Haunted cruise ship',
					id: '01JSE3SHVY1SGHA4CR20MM0AFZ',
					project: '01JRR5MA0JHEM2F87KJHN17WJS',
					order: 0,
					body: '<p>Great place for a melodramatic monologue</p>'
				}
			]
		},
		invProjMismatch: {
			projectID: '01JRR5MA0JHEM2F87KJHN17WJS',
			dbVersion: 1,
			creationDate: 1744567937043,
			exportDate: 1745304235738,
			projectName: 'The Summer Leaves',
			sections: [
				{
					name: 'Ghost therapy',
					id: '01JRR5QBWGG149KXS33YWN7W0A',
					project: 'BAD PROJECT ID',
					order: 128,
					body: '<p></p>'
				}
			],
			characters: [
				{
					name: 'Tony',
					id: '01JSE3R8BRBH31NK254R8CNCMY',
					project: '01JRR5MA0JHEM2F87KJHN17WJS',
					order: 0,
					body: '<p>Is a ghost</p>'
				}
			],
			characterDynamics: [],
			locations: [
				{
					name: 'Haunted cruise ship',
					id: '01JSE3SHVY1SGHA4CR20MM0AFZ',
					project: '01JRR5MA0JHEM2F87KJHN17WJS',
					order: 0,
					body: '<p>Great place for a melodramatic monologue</p>'
				}
			]
		}
	};
	it('Import validation', () => {
		expect(isValidProjectData(data.valid)).toBe(true);
		expect(isValidProjectData(data.invProjMismatch)).toBe(false);
	});
});
