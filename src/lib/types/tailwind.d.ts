type _twShade =
	| '50'
	| '100'
	| '200'
	| '300'
	| '400'
	| '500'
	| '600'
	| '700'
	| '800'
	| '900'
	| '950';

type _twColorName =
	| 'slate'
	| 'gray'
	| 'zinc'
	| 'neutral'
	| 'stone'
	| 'red'
	| 'orange'
	| 'amber'
	| 'yellow'
	| 'lime'
	| 'green'
	| 'emerald'
	| 'teal'
	| 'cyan'
	| 'sky'
	| 'blue'
	| 'indigo'
	| 'violet'
	| 'purple'
	| 'fuchsia'
	| 'pink'
	| 'rose'
	| 'donkey'
	| 'luigi'
	| 'smithers'
	| 'robin'
	| 'genie';

type _twInterval =
	| 50
	| 100
	| 200
	| 300
	| 400
	| 500
	| 600
	| 700
	| 800
	| -50
	| -100
	| -200
	| -300
	| -400
	| -500
	| -600
	| -700
	| -800;

export type _twColor =
	| `${'bg' | 'text'}-${_twColorName}-${_twShade}`
	| `${'bg' | 'text'}-${'black' | 'white' | 'transparent'}`;
