import type { LineConfig } from '$lib/types';


export const linesToTrack: LineConfig[] = [
	{
		// Pastourelles, Ligne 81 -> Université Paul Sabatier
		stopId: '14861',
		lineId: 'line:58',
		lineLabel: '81',
		walkTime: 3,
		stopLabel: 'Pastourelles',
		direction: 'Université Paul Sabatier',
		color: '#dc006b'
	},
	{
		// Pastourelles, Ligne 56 -> Université Paul Sabatier
		stopId: '14861',
		lineId: 'line:29',
		lineLabel: '56',
		walkTime: 3,
		stopLabel: 'Pastourelles',
		direction: 'Université Paul Sabatier',
		color: '#58ac25'
	},
	{
		// Occitanie, Ligne 82 -> Université Paul Sabatier
		stopId: '15161',
		lineId: 'line:59',
		lineLabel: '82',
		walkTime: 3,
		stopLabel: 'Occitanie',
		direction: 'Université Paul Sabatier',
		color: '#db001b'
	}
];
