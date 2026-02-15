/**
 * CONFIGURARE SIMPLĂ - Editează aici pentru a adăuga categorii și produse
 * 
 * Categorii principale: doar 2 - HAINE și ÎNCĂLȚĂMINTE
 * Subcategorii: adaugă oricâte vrei în fiecare listă
 */

// Categorii principale (2)
const MAIN_CATEGORIES = [
  { id: 'haine', name: 'Haine' },
  { id: 'incaltaminte', name: 'Încălțăminte' }
];

// Subcategorii - ADAUGĂ AICI cât de multe vrei
// Exemplu: geci, tricouri, haine sport, pantaloni, papuci fotbal, papuci sport, etc.
const SUB_CATEGORIES = {
  haine: [
    { id: 'geci', name: 'Geci' },
    { id: 'haine-sport', name: 'Haine sport' },
    { id: 'tricouri', name: 'Tricouri' },
    { id: 'pantaloni', name: 'Pantaloni' }
  ],
  incaltaminte: [
    { id: 'adidasi', name: 'Adidași' },
    { id: 'papuci-fotbal', name: 'Papuci fotbal' },
    { id: 'papuci-sport', name: 'Papuci sport' }
  ]
};
