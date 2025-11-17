export interface Pokemon {
  name: string;
  number: string;
  image: string;
  description: string;
}

export interface TierData {
  [tier: string]: Pokemon[];
}
