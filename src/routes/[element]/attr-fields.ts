import { CharacterAttr, LocationAttr, SectionAttr, DynamicAttr } from '$lib/types/db';

interface PickerOpts {
	allowCustom: boolean;
	choices: string[];
	type: 'single' | 'multiple';
}

// jon arbuckle screams:
interface CharField {
	key: keyof CharacterAttr;
	label: string;
	pickerOpts?: PickerOpts;
}

type CharFieldGroup = 'identity' | 'personality' | 'arc';

export const CHARACTER_FIELDS: { [key in CharFieldGroup]: CharField[] } = {
	identity: [
		{ key: 'age', label: 'Age' },
		{ key: 'birthday', label: 'Birthday' },
		{ key: 'gender', label: 'Gender' },
		{ key: 'hair_color', label: 'Hair color' },
		{ key: 'eye_color', label: 'Eye color' },
		{ key: 'sexuality', label: 'Sexuality' },
		{ key: 'height', label: 'Height' },
		{ key: 'body_type', label: 'Body type' },
		{ key: 'complexion', label: 'Complexion' },
		{ key: 'disabilities', label: 'Disabilities' },
		{ key: 'languages', label: 'Spoken languages' },
		{ key: 'fashion_style', label: 'Fashion/Style' }
	],
	arc: [
		{ key: 'arc_start', label: 'Starting point' },
		{ key: 'arc_end', label: 'Ending point' },
		{ key: 'arc_driver', label: 'Driving force of development' },
		{
			key: 'role',
			label: 'Role',
			pickerOpts: {
				allowCustom: true,
				choices: [
					'Protagonist',
					'Antagonist',
					'Companion',
					'Love interest',
					'Rival',
					'Comic relief',
					'Foil',
					'Mentor',
					'Sidekick'
				],
				type: 'multiple'
			}
		},
		{ key: 'goals', label: 'Goals' },
		{ key: 'motivation', label: 'Motivation' },
		{ key: 'moral_code', label: 'Morals' },
		{ key: 'backstory', label: 'Backstory' }
	],
	personality: [
		{ key: 'strengths', label: 'Strengths' },
		{ key: 'weaknesses', label: 'Weaknesses' },
		{ key: 'flaws', label: 'Flaws' },
		{ key: 'fears', label: 'Fears' },
		{ key: 'passions', label: 'Passions' },
		{ key: 'secrets', label: 'Secrets' },
		{ key: 'communication_style', label: 'Communication style' },
		{ key: 'emotional_availability', label: 'Emotional availability' },
		{ key: 'conflict_resolution', label: 'Conflict resolution' },
		{ key: 'self_esteem', label: 'Self Esteem' },
		{ key: 'insecurities', label: 'Insecurities' },
		{ key: 'emotional_intelligence', label: 'Emotional intelligence' },
		{ key: 'social_skills', label: 'Social skills' },
		{ key: 'coping_mechanisms', label: 'Coping mechanisms' },
		{ key: 'emotional_stability', label: 'Emotional stability' },
		{ key: 'habits', label: 'Habits' },
		{ key: 'quirks', label: 'Quirks' },
		{ key: 'hobbies', label: 'Hobbies' },
		{ key: 'philosophy', label: 'Philosophy' },
		{ key: 'religion', label: 'Religion' },
		{
			key: 'introvert_extrovert',
			label: 'Introvert or extrovert',
			pickerOpts: {
				allowCustom: false,
				type: 'single',
				choices: ['Introvert', 'Extrovert', 'Ambivert']
			}
		},
		{
			key: 'optimist_pessimist',
			label: 'Optimist or pessimist',
			pickerOpts: {
				allowCustom: false,
				type: 'single',
				choices: ['Optimist', 'Pessimist']
			}
		},
		{
			key: 'archetype',
			label: 'Archetype',
			pickerOpts: {
				allowCustom: false,
				type: 'single',
				// prettier-ignore
				choices: [
					'ENFJ', 'ENFP', 'ENTJ', 'ENTP',
			        'ESFJ', 'ESFP', 'ESTJ', 'ESTP',
					'INFJ', 'INFP', 'INTJ', 'INTP',
		            'ISFJ', 'ISFP', 'ISTJ', 'ISTP'
				]
			}
		}
	]
};

interface SectionField {
	key: keyof SectionAttr;
	label: string;
	pickerOpts?: PickerOpts;
}

export const SECTION_FIELDS: SectionField[] = [
	{ key: 'start_point', label: 'Starting point' },
	{ key: 'driving_force', label: 'Driving force' },
	{ key: 'conflict', label: 'Conflict' },
	{ key: 'outcome', label: 'Outcome' },
	{ key: 'outcome_reason', label: 'Reason for outcome' },
	{ key: 'significance', label: 'Significance' }
];

interface LocationField {
	key: keyof LocationAttr;
	label: string;
	pickerOpts?: PickerOpts;
}

export const LOCATION_FIELDS: LocationField[] = [
	{ key: 'history', label: 'History' },
	{ key: 'significance', label: 'Significance' },
	{ key: 'atmosphere', label: 'Atmosphere' },
	{ key: 'start_condition', label: 'Starting condition' },
	{ key: 'end_condition', label: 'Ending condition' },
	{ key: 'end_condition_reason', label: 'Reason for ending condition' },
	{ key: 'ownership', label: 'Ownership' }
];

interface DynamicField {
	key: keyof DynamicAttr;
	relatedCharFields?: (keyof CharacterAttr)[];
	label: string;
	pickerOpts?: PickerOpts;
}

type DynamicFieldGroup = 'type' | 'dynamic' | 'love' | 'basics';

// TODO design common relatedCharFields
export const DYNAMIC_FIELDS: { [key in DynamicFieldGroup]: DynamicField[] } = {
	type: [
		{
			key: 'type',
			label: 'Type of Relationship',
			pickerOpts: {
				allowCustom: true,
				type: 'multiple',
				choices: [
					'Friends',
					'Family',
					'Acquaintances',
					'Strangers',
					'Lovers',
					'Dating',
					'Married',
					'Enemies',
					'Foils',
					'Colleagues',
					'Opponents'
				]
			}
		}
	],
	dynamic: [
		{
			key: 'chemistry',
			label: 'Chemistry',
			relatedCharFields: ['introvert_extrovert', 'optimist_pessimist']
		},
		{
			key: 'chemistry_reasons',
			label: 'Reasons for chemistry',
			relatedCharFields: ['introvert_extrovert', 'optimist_pessimist']
		},
		{ key: 'incompatibility', label: 'Incompatibility' },
		{ key: 'incompatibility_reasons', label: 'Reasons for incompatibility' },
		{ key: 'misunderstandings', label: 'Misunderstandings' },
		{ key: 'conflict_sources', label: 'Sources of conflict' },
		{ key: 'rivalry_sources', label: 'Sources of rivalry' },
		{ key: 'cooperation_causes', label: 'Causes of cooperation' },
		{ key: 'shared_goals', label: 'Shared goals' },
		{ key: 'conflicting_goals', label: 'Conflicting goals' },
		{ key: 'shared_interests', label: 'Shared interests' },
		{ key: 'expectations', label: 'Expectations for relationship' },
		{ key: 'power_dynamics', label: 'Power dynamics' },
		{ key: 'outside_perception', label: 'How the relationship is viewed' }
	],
	love: [
		{
			key: 'affection',
			label: 'Affection',
			pickerOpts: {
				allowCustom: true,
				type: 'single',
				choices: ['Loving', 'Warm', 'Neutral', 'Cold', 'Hostile']
			}
		},
		{ key: 'attraction', label: 'Attraction' },
		{ key: 'intensity', label: 'Intensity' }
	],
	basics: [
		{ key: 'respect', label: 'Respect' },
		{ key: 'trust', label: 'Trust' },
		{ key: 'faith', label: 'Faith' },
		{ key: 'vulnerability', label: 'Vulnerability' },
		{ key: 'loyalty', label: 'Loyalty' },
		{ key: 'loyalty_reasons', label: 'Reasons for loyalty' }
	]
};
