export class Result {
    name: string;
    percent: number;
    intersection: boolean;
    smallerElem: number;
    difPercent: number;
}

export class FileInfo {
    etfName: string;
    bigger: boolean;    
    file: [];            
    date: string;
    size: number;          
}

export class ChartData {
    chartNames: string[];
    chartPercentBigger: number[];
    chartPercentSmaller: number[];
    chartPercentDif: number[];
}