export interface Margin {
  top: number;
  bottom: number;
  right: number;
  left: number;
}

export interface GraphDatapoint {
  timestamp: Date;
  value: number;
}

export interface PieDatapoint {
  category: string;
  value: number;
}