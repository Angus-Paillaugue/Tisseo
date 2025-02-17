import type { Line, Stop } from "./types";

export const stops: Stop[] = [
	// Line 81 -> Université Paul Sabatier
	{
		id: '27053',
		label: 'Castanet-Tolosan'
	},
	{
		id: '14961',
		label: 'Chaumière'
	},
	{
		id: '15271',
		label: 'Ch. du Carrelet'
	},
	{
		id: '1521',
		label: 'Clotasses'
	},
	{
		id: '14971',
		label: 'Complexe Agricole'
	},
	{
		id: '14871',
		label: 'Deux Ormeaux'
	},
	{
		id: '15011',
		label: 'Ecole Castanet'
	},
	{
		id: '14991',
		label: 'Grand Chemin'
	},
	{
		id: '15031',
		label: 'Halles'
	},
	{
		id: '14831',
		label: 'Lapeyrade'
	},
	{
		id: '15021',
		label: 'Mairie Castanet'
	},
	{
		id: '14851',
		label: 'Mairie Ramonville'
	},
	{
		id: '14981',
		label: 'Moulin Armand'
	},
	{
		id: '14811',
		label: 'Parc St Agne'
	},
	{
		id: '14861',
		label: 'Pastourelles'
	},
	{
		id: '15043',
		label: 'Peries'
	},
	{
		id: '15001',
		label: 'Peupliers'
	},
	{
		id: '14841',
		label: 'Poste de Ramonville'
	},
	{
		id: '20831',
		label: 'Ramonville Sud'
	},

	// Line 81 -> Castanet-Tolosan
	{
		id: '14960',
		label: 'Chaumière'
	},
	{
		id: '15270',
		label: 'Ch. du Carrelet'
	},
	{
		id: '1520',
		label: 'Clotasses'
	},
	{
		id: '14970',
		label: 'Complexe Agricole'
	},
	{
		id: '14870',
		label: 'Deux Ormeaux'
	},
	{
		id: '15010',
		label: 'Ecole Castanet'
	},
	{
		id: '14990',
		label: 'Grand Chemin'
	},
	{
		id: '15030',
		label: 'Halles'
	},
	{
		id: '14830',
		label: 'Lapeyrade'
	},
	{
		id: '15020',
		label: 'Mairie Castanet'
	},
	{
		id: '14850',
		label: 'Mairie Ramonville'
	},
	{
		id: '14980',
		label: 'Moulin Armand'
	},
	{
		id: '14810',
		label: 'Parc St Agne'
	},
	{
		id: '14860',
		label: 'Pastourelles'
	},
	{
		id: '15042',
		label: 'Peries'
	},
	{
		id: '15000',
		label: 'Peupliers'
	},
	{
		id: '14840',
		label: 'Poste de Ramonville'
	},
	{
		id: '20830',
		label: 'Ramonville Sud'
	},
	{
		id: '5934',
		label: 'Université Paul Sabatier'
	},

	// Ligne 82 -> Université Paul Sabatier
	{
		id: '15161',
		label: 'Occitanie'
	},

	// Ligne 82 -> Ramonville Port Sud
	{
		id: '15160',
		label: 'Occitanie'
	}
];

export const getStopFromId = (id: Stop['id']): Stop | undefined =>
	stops.find((stop) => stop.id === id);

export const lines: Line[] = [
	// Line 81
	{
		id: 'line:58',
		label: '81',
		direction: 'Université Paul Sabatier',
		color: '#dc006b',
		stops: [
			getStopFromId('27053') as Stop,
			getStopFromId('14961') as Stop,
			getStopFromId('15271') as Stop,
			getStopFromId('1521') as Stop,
			getStopFromId('14971') as Stop,
			getStopFromId('14871') as Stop,
			getStopFromId('15011') as Stop,
			getStopFromId('14991') as Stop,
			getStopFromId('15031') as Stop,
			getStopFromId('14831') as Stop,
			getStopFromId('15021') as Stop,
			getStopFromId('14851') as Stop,
			getStopFromId('14981') as Stop,
			getStopFromId('14811') as Stop,
			getStopFromId('14861') as Stop,
			getStopFromId('15043') as Stop,
			getStopFromId('15001') as Stop,
			getStopFromId('14841') as Stop,
			getStopFromId('20831') as Stop
		]
	},
	{
		id: 'line:58',
		label: '81',
		color: '#dc006b',
		direction: 'Castanet-Tolosan',
		stops: [
			getStopFromId('14960') as Stop,
			getStopFromId('15270') as Stop,
			getStopFromId('1520') as Stop,
			getStopFromId('14970') as Stop,
			getStopFromId('14870') as Stop,
			getStopFromId('15010') as Stop,
			getStopFromId('14990') as Stop,
			getStopFromId('15030') as Stop,
			getStopFromId('14830') as Stop,
			getStopFromId('15020') as Stop,
			getStopFromId('14850') as Stop,
			getStopFromId('14980') as Stop,
			getStopFromId('14810') as Stop,
			getStopFromId('14860') as Stop,
			getStopFromId('15042') as Stop,
			getStopFromId('15000') as Stop,
			getStopFromId('14840') as Stop,
			getStopFromId('20830') as Stop,
			getStopFromId('5934') as Stop
		]
	},

	// Line 56
	{
		id: 'line:29',
		label: '56',
		color: '#58ac25',
		direction: 'Université Paul Sabatier',
		stops: [getStopFromId('14861') as Stop]
	},
	{
		id: 'line:29',
		label: '56',
		color: '#58ac25',
		direction: 'Auzeville Eglise',
		stops: [getStopFromId('14861') as Stop]
	},

	// Line 82
	{
		id: 'line:59',
		label: '82',
		color: '#db001b',
		direction: 'Université Paul Sabatier',
		stops: [getStopFromId('15161') as Stop]
	},
	{
		id: 'line:59',
		label: '82',
		color: '#db001b',
		direction: 'Ramonville Port Sud'
	}
];

export const getLineStop = (line: Line, stopId: Stop['id']): Stop | undefined =>
	line?.stops?.find((stop) => stop.id === stopId);

export const getLineFromStopId = (stopId: Stop['id']): Line | undefined =>
	lines.find((line) => line.stops?.some((stop) => stop.id === stopId));

export const getLineWithStop = (lineId: Line['id'], stopId: Stop['id']): Line | undefined =>
	lines.find((line) => line.id === lineId && line.stops?.some((stop) => stop.id === stopId));

export const getLineWithStopAndLabel = (lineLabel: Line['label'], stopId: Stop['id']): Line | undefined =>
	lines.find((line) => line.label === lineLabel && line.stops?.some((stop) => stop.id === stopId));
