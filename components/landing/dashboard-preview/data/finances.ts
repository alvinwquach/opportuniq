export const shoppingList = [
  { id: '1', productName: 'Furnace Flame Sensor', storeName: 'Menards', estimatedCost: 12.99, inStock: true },
  { id: '2', productName: 'Fine Grit Sandpaper', storeName: 'Home Depot', estimatedCost: 4.99, inStock: true },
  { id: '3', productName: 'Sump Pump Check Valve', storeName: 'Lowe\'s', estimatedCost: 18.99, inStock: true },
];

export const pendingVendors = [
  { id: '1', vendorName: 'Buckeye Heating & Cooling', issueTitle: 'Furnace not igniting', rating: 4.9, quoteAmount: 185 },
  { id: '2', vendorName: 'Columbus Comfort Systems', issueTitle: 'Furnace not igniting', rating: 4.7, quoteAmount: 195 },
];

export const recentExpenses = [
  { id: '1', description: 'Furnace filter (4-pack)', category: 'HVAC', amount: 24.99, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), issueId: '1', issueTitle: 'Furnace maintenance' },
  { id: '2', description: 'Toilet flapper valve', category: 'Plumbing', amount: 7.99, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), issueId: '6', issueTitle: 'Toilet flapper replacement' },
  { id: '3', description: 'Water heater anode rod', category: 'Plumbing', amount: 27.99, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), issueId: '4', issueTitle: 'Water heater anode rod' },
  { id: '4', description: 'Pipe insulation foam', category: 'Plumbing', amount: 12.99, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
];
