  export const postTypes = [
    { key: 'general', label: 'General' },
    { key: 'record', label: 'Car Record' },
    { key: 'listing', label: 'Listing (for sale)' },
    { key: 'want', label: 'Want-ad' },
    { key: 'spot', label: 'Spotted' },
  ];
	
	export const postCategories = [
    {
      type: "general",
      items: [
        { key: "show", label: "Show" },
        { key: "misc", label: "Misc." },
      ],
    },
    {
      type: "listing",
      items: [
        { key: "new", label: "New Part" },
        { key: "used", label: "Used Part" },
        { key: "car", label: "Car" },
        { key: "accessories", label: "Accessories" },
        { key: "other", label: "Other" },
      ],
    },
    {
      type: "want",
      items: [
        { key: "part", label: "Part" },
        { key: "car", label: "Car" },
        { key: "other", label: "Other" },
      ],
    },
    {
      type: "spot",
      items: [
        { key: "show", label: "Show" },
        { key: "museum", label: "Museum" },
        { key: "wild", label: "In the wild" },
      ],
    },
    {
      type: "record",
      items: [
        { key: "general", label: "General" },
        { key: "mod", label: "Mod" },
        { key: "restoration", label: "Restoration" },
        { key: "maintenance", label: "Maintenance" },
        { key: "detailing", label: "Detailing" },
      ],
    },
  ];


export const carTypes = [
  { key: 'daily', label: 'Daily Driver' },
  { key: 'weekend', label: 'Weekend Warrior' },
  { key: 'project', label: 'Project Car' },
  { key: 'garage-queen', label: 'Garage Queen' },
  { key: 'part-out', label: 'Part Out' },
  { key: 'other', label: 'Other' },
];

export const carCategories = [
  {
    type: "daily",
    items: [
      { key: "groceryGetter", label: "Grocery Getter" },
      { key: "beater", label: "Beater" },
      { key: "shibox", label: "Shitbox" },
      { key: "other", label: "Other" },
    ],
  },
  {
    type: "weekend",
    items: [
      { key: "carsAndCoffee", label: "Cars & Coffee Machine" },
      { key: "canyonCarver", label: "Canyon Carver" },
      { key: "race", label: "Race Car" },
      { key: "historical", label: "Historical" },
    ],
  },
  {
    type: "project",
    items: [
      { key: "hopefulRestoration", label: "Hopeful Restoration" },
      { key: "lostCause", label: "Lost Cause" },
      { key: "race", label: "Race Car" },
      { key: "historical", label: "Historical" },
      { key: "shibox", label: "Shitbox" },
      { key: "other", label: "Other" },
    ],
  },
  {
    type: "garage-queen",
    items: [
      { key: "concours", label: "Concours" },
      { key: "specialOccasion", label: "Special Occasion Car" },
      { key: "race", label: "Race Car" },
      { key: "historical", label: "Historical" },
      { key: "other", label: "Other" },
    ],
  },
  {
    type: "part-out",
    items: [],
  },
  {
    type: "other",
    items: [],
  },
];