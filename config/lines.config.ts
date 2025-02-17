import type { Line, Stop } from '$lib/types';

export const linesToTrack: { stopId: Stop['id']; lineLabel: Line['label'] }[] = [
	{
		// Pastourelles, Ligne 81 -> Université Paul Sabatier
		stopId: '14861',
		lineLabel: '81'
	},
	{
		// Pastourelles, Ligne 56 -> Université Paul Sabatier
		stopId: '14861',
		lineLabel: '56' // 56
	},
	{
		// Occitanie, Ligne 82 -> Université Paul Sabatier
		stopId: '15161',
		lineLabel: '82' // 82
	}
];
