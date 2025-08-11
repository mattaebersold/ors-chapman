// Post schema based on Murray's postTypes.js
export const Schema = {
  private: "",
  gallery: "",
  title: "",
  body: "",
  type: "",
  category: "",
  year: "",
  make: "",
  model: "",
  trim: "",
  color: "",
  car_id: "",
  group_id: "",
  project_id: "",
  event_id: "",
  video: "",
  video_id: "",
};

export const associationTypes = ["garage", "projects", "events", "groups"];

export const associationState = {
  garage: "",
  projects: "",
  events: "",
  groups: "",
};

export const idMap = {
  garage: "car",
  groups: "group",
  events: "event",
  projects: "project",
};

export const types = [
  {
    key: "general",
    label: "General",
  },
  {
    key: "record",
    label: "Car Record",
  },
  {
    key: "listing",
    label: "Listing (for sale)",
  },
  {
    key: "want",
    label: "Want-ad",
  },
  {
    key: "spot",
    label: "Spotted",
  },
];

export const categories = [
  {
    type: "general",
    items: [
      {
        key: "show",
        label: "Show",
      },
      {
        key: "misc",
        label: "Misc.",
      },
    ],
  },
  {
    type: "listing",
    items: [
      {
        key: "new",
        label: "New Part",
      },
      {
        key: "used",
        label: "Used Part",
      },
      {
        key: "car",
        label: "Car",
      },
      {
        key: "accessories",
        label: "Accessories",
      },
      {
        key: "other",
        label: "Other",
      },
    ],
  },
  {
    type: "want",
    items: [
      {
        key: "part",
        label: "Part",
      },
      {
        key: "car",
        label: "Car",
      },
      {
        key: "other",
        label: "Other",
      },
    ],
  },
  {
    type: "spot",
    items: [
      {
        key: "show",
        label: "Show",
      },
      {
        key: "museum",
        label: "Museum",
      },
      {
        key: "wild",
        label: "In the wild",
      },
    ],
  },
  {
    type: "record",
    items: [
      {
        key: "general",
        label: "General",
      },
      {
        key: "mod",
        label: "Mod",
      },
      {
        key: "restoration",
        label: "Restoration",
      },
      {
        key: "maintenance",
        label: "Maintenance",
      },
      {
        key: "detailing",
        label: "Detailing",
      },
    ],
  },
];