export interface RateableEntity {
  id: string;
  rating?: number[];
  [key: string]: any;
}
