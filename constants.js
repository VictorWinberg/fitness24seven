const Day = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const User = {
  VW: "USER_VW",
  AO: "USER_AO",
};

const Gym = {
  "lilla torg": { var: "malmo-lilla-torg", name: "Malmö Lilla Torg GROUP" },
  dalaplan: { var: "malmoe-dalaplan", name: "Malmö Dalaplan GROUP" },
  katrinelund: { var: "malmoe-katrinelund", name: "Malmö Katrinelund GROUP" },
  kronprinsen: { var: "malmoe-kronprinsen", name: "Malmö Kronprinsen GROUP" },
  värnhem: { var: "malmoe-vaernhem", name: "Malmö Värnhem GROUP" },
};

const Workout = {
  bodypump: { var: "bodypump", name: "BODYPUMP®" },
  bodystep: { var: "bodystep", name: "BODYSTEP®" },
  bodycombat: { var: "bodycombat", name: "BODYCOMBAT®" },
  bodyattack: { var: "bodyattack", name: "BODYATTACK®" },
  bodybalance: { var: "bodybalance", name: "BODYBALANCE®" },
  box: { var: "box", name: "BOX" },
  "hiit the cage": { var: "hiit-the-cage", name: "HIIT THE CAGE" },
  "hiit the zone": { var: "hiit-the-zone", name: "HIIT THE ZONE" },
};

module.exports = { Day, User, Gym, Workout };
