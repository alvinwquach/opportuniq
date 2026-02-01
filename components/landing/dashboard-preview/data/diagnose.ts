export const diagnoseData = {
  issue: {
    title: 'Furnace not igniting',
    description: 'Furnace clicks and attempts to ignite but flame doesn\'t stay lit. Shuts off after a few seconds.',
    photos: ['furnace1.jpg'],
  },
  analysis: {
    diagnosis: 'Dirty flame sensor (most likely) or faulty igniter',
    confidence: 89,
    difficulty: 'Easy',
    estimatedTime: '20-30 min',
    parts: [
      { id: 'part-1', name: 'Universal Flame Sensor', price: 12.99, store: 'Menards', address: '2100 Morse Rd, Columbus', inStock: true, rating: 4.6, link: '#' },
      { id: 'part-2', name: 'Fine Grit Sandpaper (for cleaning)', price: 4.99, store: 'Home Depot', address: '1555 Gemini Pl, Columbus', inStock: true, rating: 4.8, link: '#' },
      { id: 'part-3', name: 'Carrier Igniter 62-24141-02', price: 34.99, store: 'Grainger', address: '1100 Kinnear Rd, Columbus', inStock: true, rating: 4.7, link: '#' },
    ],
    costComparison: {
      diy: 17.98,
      pro: 185,
      savings: 167.02,
    },
    ppe: [
      { item: 'Safety glasses', priority: 'required' as const, reason: 'Protect eyes from debris when cleaning flame sensor' },
      { item: 'Work gloves', priority: 'recommended' as const, reason: 'Avoid cuts on sheet metal edges' },
      { item: 'Flashlight', priority: 'suggested' as const, reason: 'Illuminate inside furnace cabinet' },
    ],
    doNotProceedWithout: ['Turn off power to furnace at breaker', 'Turn off gas supply valve', 'Safety glasses'],
    hazards: ['Natural gas leak risk', 'Electrical shock', 'Sharp metal edges'],
  },
  research: {
    sources: [
      { type: 'reddit', title: 'r/HVAC: Furnace clicks but won\'t ignite - flame sensor fix', upvotes: 342, link: '#' },
      { type: 'reddit', title: 'r/HomeImprovement: Same issue, cleaning flame sensor worked', upvotes: 156, link: '#' },
      { type: 'youtube', title: 'Furnace Not Igniting - Clean Flame Sensor Fix', views: '2.1M', link: '#' },
    ],
  },
  recommendations: [
    { id: 'pro-1', name: 'Buckeye Heating & Cooling', rating: 4.9, reviews: 234, distance: '3.2 mi', price: 185, address: '1850 Crown Park Ct, Columbus', phone: '(614) 555-1234', available: 'Today 2-5pm', source: 'angi', email: 'service@buckeyehvac.com' },
    { id: 'pro-2', name: 'Columbus Comfort Systems', rating: 4.7, reviews: 156, distance: '4.1 mi', price: 195, address: '890 Bethel Rd, Columbus', phone: '(614) 555-5678', available: 'Tomorrow 9am', source: 'yelp', email: 'info@columbuscomfort.com' },
    { id: 'pro-3', name: 'Five Star Heating', rating: 4.8, reviews: 312, distance: '5.8 mi', price: 175, address: '2200 Dublin Granville Rd, Columbus', phone: '(614) 555-9012', available: 'Tomorrow 1pm', source: 'homeadvisor', email: 'contact@fivestarhvac.com' },
  ],
};
