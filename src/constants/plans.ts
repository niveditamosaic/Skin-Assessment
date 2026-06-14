export interface ProductItem {
  name: string;
  type: 'otc' | 'rx';
}

export const PRODUCT_PRICES: Record<string, string> = {
  'Anti-Acne Face Wash':               '₹599',
  'Pigmentation Serum':                '₹799',
  'Sunscreen SPF 50':                  '₹699',
  'Clindamycin / Adapalene Gel':       '₹899',
  'Tretinoin Night Cream':             '₹1,299',
  'Hydroquinone / Azelaic Acid Cream': '₹999',
};

export interface PlanDefinition {
  name: string;
  description: string;
  products: ProductItem[];
}

export const PLANS: Record<number, PlanDefinition> = {
  1: {
    name: 'Mild Acne Care',
    description: 'A targeted daily routine to clear active breakouts and stop new ones from forming.',
    products: [
      { name: 'Anti-Acne Face Wash', type: 'otc' },
      { name: 'Sunscreen SPF 50', type: 'otc' },
      { name: 'Clindamycin / Adapalene Gel', type: 'rx' },
    ],
  },
  2: {
    name: 'Acne and Dark Spot Correction',
    description: 'Clears breakouts while fading post-acne marks and pigmentation simultaneously.',
    products: [
      { name: 'Anti-Acne Face Wash', type: 'otc' },
      { name: 'Pigmentation Serum', type: 'otc' },
      { name: 'Sunscreen SPF 50', type: 'otc' },
      { name: 'Clindamycin / Adapalene Gel', type: 'rx' },
    ],
  },
  3: {
    name: 'Intensive Acne Treatment',
    description: 'A stronger clinical-grade routine for persistent or recurring acne.',
    products: [
      { name: 'Anti-Acne Face Wash', type: 'otc' },
      { name: 'Sunscreen SPF 50', type: 'otc' },
      { name: 'Tretinoin Night Cream', type: 'rx' },
    ],
  },
  4: {
    name: 'Complete Skin Correction',
    description: 'Intensive treatment for chronic acne combined with pigmentation and uneven tone.',
    products: [
      { name: 'Anti-Acne Face Wash', type: 'otc' },
      { name: 'Pigmentation Serum', type: 'otc' },
      { name: 'Sunscreen SPF 50', type: 'otc' },
      { name: 'Tretinoin Night Cream', type: 'rx' },
    ],
  },
  5: {
    name: 'Dark Spot Reversal',
    description: 'Targets stubborn dark marks and uneven skin tone with a brightening Rx formula.',
    products: [
      { name: 'Pigmentation Serum', type: 'otc' },
      { name: 'Sunscreen SPF 50', type: 'otc' },
      { name: 'Hydroquinone / Azelaic Acid Cream', type: 'rx' },
    ],
  },
  6: {
    name: 'Tan and Pigmentation Reset',
    description: 'Reverses sun-induced tanning and uneven patches with a targeted brightening plan.',
    products: [
      { name: 'Sunscreen SPF 50', type: 'otc' },
      { name: 'Pigmentation Serum', type: 'otc' },
      { name: 'Hydroquinone / Azelaic Acid Cream', type: 'rx' },
    ],
  },
};
