export interface MomentAttr {
	conflict?: string;
	significance?: string;
	start_point?: string;
	driving_force?: string;
	end_point?: string;
	outcome_reason?: string;
	notes?: Delta;
}

export interface ThemeAttr {
	thesis?: string;
	conflict?: string;
	journey?: string;
	conclusion?: string;
	conclusion_reason?: string;
}

export interface LocationAttr {
	description?: string;
	history?: string;
	significance?: string;
}

export interface CharacterAttr {
	// (i) appearance/identity
	birthday?: string;
	languages?: string;
	age?: string;
	gender?: string;
	sexuality?: string;
	hair_color?: string;
	height?: string;
	body_type?: string;
	complexion?: string;
	fashion_style?: string;
	disabilities?: string;
	eye_color?: string;

	// (i) arc
	role?: string;
	goals?: string;
	moral_code?: string;
	motivation?: string;
	backstory?: string;
	arc_start?: string;
	arc_driver?: string;
	arc_end?: string;

	// (i) personality/psyche
	strengths?: string;
	weaknesses?: string;
	flaws?: string;
	secrets?: string;
	fears?: string;
	passions?: string;
	communication_style?: string;
	emotional_availability?: string;
	conflict_resolution?: string;
	self_esteem?: string;
	insecurities?: string;
	emotional_intelligence?: string;
	social_skills?: string;
	charisma?: string;
	coping_mechanisms?: string;
	emotional_stability?: string;
	ambition?: string;
	phobias?: string;
	habits?: string;
	quirks?: string;
	hobbies?: string;
	philosophy?: string;
	religion?: string;
	introvert_extrovert?: string;
	optimist_pessimist?: string;
}

export interface DynamicAttr {
	// (i) type
	/**
	 * Enforce as Set
	 */
	type?: (
		| 'friends'
		| 'family'
		| 'acquaintances'
		| 'strangers'
		| 'lovers'
		| 'dating'
		| 'enemies'
		| 'foils'
		| 'colleagues'
		| 'opponents'
	)[];

	// (i) dynamic
	chemistry?: string;
	chemistry_reasons?: string;
	incompatibility?: string;
	incompatibility_reasons?: string;
	health?: 'excellent' | 'good' | 'friendly' | 'neutral' | 'unfriendly' | 'toxic' | 'hostile';
	health_reasons?: string;
	misunderstandings?: string;
	conflict_sources?: string;
	rivalry_sources?: string;
	cooperation_sources?: string;
	shared_goals?: string;
	conflicting_goals?: string;
	manipulation?: string;
	expectations?: string;
	expectation_fulfillment?: string;
	communication_style?: string;
	power_dynamics?: string;
	mutual_influence?: string;
	outside_perception?: string; // of the relationship

	// (i) love and hate
	affection?: 'loving' | 'warm' | 'neutral' | 'cold' | 'venomous';
	intensity?: 'fiery' | 'passionate' | 'lukewarm' | 'neutral' | 'unfeeling';
	attraction?: string;

	// (i) dynamic/relationship fundamentals
	respect?: string;
	trust?: 'none' | 'low' | 'medium' | 'high' | 'absolute';
	faith?: 'none' | 'low' | 'medium' | 'high' | 'absolute';
	vulnerability?: string;
	loyalty?: string;
	loyalty_reasons?: string;
}
