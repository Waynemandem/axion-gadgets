export const PICKUP_NOTE =
  "Pickup is in Ikeja, Lagos. We'll message you the exact spot once your order is confirmed.";

// Delivery fees in naira. Change these to your real numbers.
// Also i want the delivery fee to be depend on the location of the customer, sometimes locations in Lagos can cost more than #5,000 to deliver a Phone to. 

export const DELIVERY_FEES = {
  lagos: 5000,
  other: 7000,
};

export function deliveryFee(state: string) {
  return state === "Lagos" ? DELIVERY_FEES.lagos : DELIVERY_FEES.other;
}

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];