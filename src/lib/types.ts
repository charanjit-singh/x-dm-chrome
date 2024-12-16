export interface RunReportItem {
  username: string;
  sent: boolean;
  message?: string;
}

export interface RunReport {
  startedAt: string;
  items: RunReportItem[];
}
