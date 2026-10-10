export const PICKUP_NOTE =
  "Pickup is in Ikeja, Lagos. We'll message you the exact spot once your order is confirmed.";

export type DeliveryZone = { state: string; label: string; fee: number };

// Your delivery areas and fees in naira. Edit this list as you grow.
export const DELIVERY_ZONES: DeliveryZone[] = [
  { state: "Lagos", label: "Lagos", fee: 3000 },
  { state: "Ogun", label: "Ogun", fee: 5000 },
  { state: "Oyo", label: "Oyo (Ibadan)", fee: 6000 },
];

export function deliveryFee(state: string): number | null {
  return DELIVERY_ZONES.find((z) => z.state === state)?.fee ?? null;
}