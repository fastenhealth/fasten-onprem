export interface EventSourceSync extends Event {
  event_type: string;
  source_id: string;
  resource_type: string;
  resource_id: string;
}
