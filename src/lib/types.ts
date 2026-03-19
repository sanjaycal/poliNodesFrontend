import { type Any } from '$lib/utils'; // mock TS to allow Any if needed

export interface Point {
    x: number;
    y: number;
}

export interface NodeDefinition {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    title: string;
    inputTypes: string[];
    outputTypes: string[];
    inputLabels: string[];
    outputLabels: string[];
    color: string;
    resultHTML?: string;
    attrs: Record<string, any>;
}

export interface EdgeDefinition {
    id: string;
    fromNode: string;
    fromSocket: number;
    toNode: string;
    toSocket: number;
}

export interface GraphDefinition {
    nodes: NodeDefinition[];
    edges: EdgeDefinition[];
}

export const PROVINCES = [
    'Alberta',
    'British Columbia/Colombie-Britannique',
    'Manitoba',
    'New Brunswick/Nouveau-Brunswick',
    'Newfoundland and Labrador/Terre-Neuve-et-Labrador',
    'Northwest Territories/Territoires du Nord-Ouest',
    'Nova Scotia/Nouvelle-Écosse',
    'Nunavut',
    'Ontario',
    'Prince Edward Island/Île-du-Prince-Édouard',
    'Quebec/Québec',
    'Saskatchewan',
    'Yukon'
];

export const PARTIES = [
    'Liberal/Libéral',
    'Conservative/Conservateur',
    'NDP-New Democratic Party/NPD-Nouveau Parti démocratique',
    'Bloc Québécois/Bloc Québécois',
    'Green Party/Parti Vert'
];

export const NODE_TYPES_CONFIG: Record<string, { title: string, inputTypes: string[], outputTypes: string[], inputLabels: string[], outputLabels: string[], color: string, defaultWidth: number }> = {
    'floatNode': { title: 'Float Value', inputTypes: [], outputTypes: ['FLOAT'], inputLabels: [], outputLabels: ['Value'], color: '#a0aec0', defaultWidth: 150 },
    'dataSourceNode': { title: 'Data Source', inputTypes: [], outputTypes: ['VOTECOUNTRIDINGTABLE'], inputLabels: [], outputLabels: ['Table'], color: '#3182ce', defaultWidth: 180 },
    'findWinnerNode': { title: 'Find Winner', inputTypes: ['VOTECOUNTRIDINGTABLE'], outputTypes: ['RIDINGWINNERTABLE'], inputLabels: ['Table'], outputLabels: ['Winners'], color: '#dd6b20', defaultWidth: 180 },
    'collateWinnersNode': { title: 'Collate Winners', inputTypes: ['RIDINGWINNERTABLE'], outputTypes: ['COLLATEDSEATSTABLE'], inputLabels: ['Winners'], outputLabels: ['Seats'], color: '#805ad5', defaultWidth: 180 },
    'barChartNode': { title: 'Bar Chart', inputTypes: ['ANYCOLLATEDTABLE'], outputTypes: ['IMAGE'], inputLabels: ['Table'], outputLabels: ['Chart'], color: '#38a169', defaultWidth: 400 },
    'tableViewNode': { title: 'Table View', inputTypes: ['ANYTABLE'], outputTypes: ['IMAGE'], inputLabels: ['Table'], outputLabels: ['View'], color: '#718096', defaultWidth: 400 },
    'uniformSwingNode': { title: 'Uniform Swing', inputTypes: ['VOTECOUNTRIDINGTABLE', 'FLOAT', 'FLOAT', 'FLOAT', 'FLOAT', 'FLOAT'], outputTypes: ['VOTECOUNTRIDINGTABLE'], inputLabels: ['Table', 'Liberal', 'Conservative', 'NDP', 'Bloc', 'Green'], outputLabels: ['Table'], color: '#e53e3e', defaultWidth: 200 },
    'proportionalSwingNode': { title: 'Proportional Swing', inputTypes: ['VOTECOUNTRIDINGTABLE', 'FLOAT', 'FLOAT', 'FLOAT', 'FLOAT', 'FLOAT'], outputTypes: ['VOTECOUNTRIDINGTABLE'], inputLabels: ['Table', 'Liberal', 'Conservative', 'NDP', 'Bloc', 'Green'], outputLabels: ['Table'], color: '#d53f8c', defaultWidth: 200 },
    'mixVoteCountTableNode': { title: 'Mix Vote Tables (Lerp)', inputTypes: ['VOTECOUNTRIDINGTABLE', 'VOTECOUNTRIDINGTABLE', 'FLOAT'], outputTypes: ['VOTECOUNTRIDINGTABLE'], inputLabels: ['Table A', 'Table B', 'Mix Factor'], outputLabels: ['Table'], color: '#00b5d8', defaultWidth: 200 },
    'filterProvinceNode': { title: 'Filter by Province', inputTypes: ['ANYRIDINGTABLE', 'PROVINCE'], outputTypes: ['ANYRIDINGTABLE', 'ANYRIDINGTABLE'], inputLabels: ['Table', 'Province'], outputLabels: ['In Province', 'Not In Province'], color: '#ed8936', defaultWidth: 200 },
    'provinceNode': { title: 'Province Name', inputTypes: [], outputTypes: ['PROVINCE'], inputLabels: [], outputLabels: ['Province'], color: '#f6ad55', defaultWidth: 200 },
    'mergeTablesNode': { title: 'Merge Tables', inputTypes: ['ANYRIDINGTABLE', 'ANYRIDINGTABLE'], outputTypes: ['ANYRIDINGTABLE'], inputLabels: ['Table A', 'Table B'], outputLabels: ['Merged'], color: '#1a365d', defaultWidth: 200 },
    'addNode': { title: 'Add', inputTypes: ['FLOAT', 'FLOAT'], outputTypes: ['FLOAT'], inputLabels: ['A', 'B'], outputLabels: ['Result'], color: '#4299e1', defaultWidth: 150 },
    'subtractNode': { title: 'Subtract', inputTypes: ['FLOAT', 'FLOAT'], outputTypes: ['FLOAT'], inputLabels: ['A', 'B'], outputLabels: ['Result'], color: '#4299e1', defaultWidth: 150 },
    'multiplyNode': { title: 'Multiply', inputTypes: ['FLOAT', 'FLOAT'], outputTypes: ['FLOAT'], inputLabels: ['A', 'B'], outputLabels: ['Result'], color: '#4299e1', defaultWidth: 150 },
    'divideNode': { title: 'Divide', inputTypes: ['FLOAT', 'FLOAT'], outputTypes: ['FLOAT'], inputLabels: ['A', 'B'], outputLabels: ['Result'], color: '#4299e1', defaultWidth: 150 },
    'collateVotesNode': { title: 'Collate Votes', inputTypes: ['VOTECOUNTRIDINGTABLE'], outputTypes: ['COLLATEDVOTETABLE'], inputLabels: ['Table'], outputLabels: ['Votes'], color: '#805ad5', defaultWidth: 180 },
    'convertToPercentagesRidingNode': {title: 'Convert Riding Table To Percentages', inputTypes: ['VOTECOUNTRIDINGTABLE'], outputTypes: ['RIDINGPERCENTAGETABLE'], inputLabels: ['Riding Vote Count Table'], outputLabels: ['Percentages Table'], color: '#dd6b20', defaultWidth: 200},
    'convertToPercentagesCollatedNode': {title: 'Convert Collated Table To Percentages', inputTypes: ['COLLATEDVOTETABLE'], outputTypes: ['COLLATEDPERCENTAGETABLE'], inputLabels: ['Collated Vote Count Table'], outputLabels: ['Percentages Table'], color: '#dd6b20', defaultWidth: 200},
    'partyNode': { title: 'Party Name', inputTypes: [], outputTypes: ['PARTY'], inputLabels: [], outputLabels: ['Party'], color: '#9f7aea', defaultWidth: 200 },
    'noteNode': { title: 'Note', inputTypes: [], outputTypes: [], inputLabels: [], outputLabels: [], color: '#ecc94b', defaultWidth: 250 },
    'extractCollatedNode': { title: 'Extract Value', inputTypes: ['ANYTABLE', 'PARTY'], outputTypes: ['FLOAT'], inputLabels: ['Table', 'Party'], outputLabels: ['Count'], color: '#f56565', defaultWidth: 180 },
    'floatDisplayNode': { title: 'Float Display', inputTypes: ['FLOAT'], outputTypes: ['IMAGE'], inputLabels: ['Value'], outputLabels: ['View'], color: '#a0aec0', defaultWidth: 150 }
};
