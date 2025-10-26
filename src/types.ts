export type ChartPoint = {
  name: string;
  calls: number;
};

export type UserChartRow = {
  id: string;
  email: string;
  chart_key: string;
  chart_data: any;
  created_at: string;
  updated_at: string;
};
