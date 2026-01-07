export interface EventItem {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO
  end: string; // ISO
  location?: string;
  tags?: string[];
}
