const User = {
  VW: "USER_VW",
  AO: "USER_AO",
};

const Gyms = [
  { id: 28, name: "Göteborg Kungsgatan GROUP", key: "kungsgatan" },
  { id: 121, name: "Göteborg Olskroken GROUP", key: "olskroken" },
  { id: 105, name: "Göteborg Ullevi GROUP", key: "ullevi" },
  { id: 2, name: "Helsingborg Kullagatan GROUP", key: "kullagatan" },
  { id: 5, name: "Lund Centrum GROUP", key: "lund centrum" },
  { id: 77, name: "Malmö Dalaplan GROUP", key: "dalaplan" },
  { id: 56, name: "Malmö Katrinelund GROUP", key: "katrinelund" },
  { id: 260, name: "Malmö Kronprinsen GROUP", key: "kronprinsen" },
  { id: 119, name: "Malmö Lilla Torg GROUP", key: "lilla torg" },
  { id: 162, name: "Malmö Rosengård C GROUP", key: "rosengård" },
  { id: 21, name: "Malmö Värnhem GROUP", key: "värnhem" },
  { id: 75, name: "Stockholm Fruängen C GROUP", key: "fruängen" },
  { id: 76, name: "Stockholm Hötorget GROUP", key: "hötorget" },
  { id: 234, name: "Stockholm Odenplan GROUP", key: "odenplan" },
  { id: 88, name: "Stockholm Regeringsgatan GROUP", key: "regeringsgatan" },
  { id: 133, name: "Stockholm Skanstull GROUP", key: "skanstull" },
];

const Workouts = [
  { key: "bodypump" },
  { key: "bodystep" },
  { key: "bodycombat" },
  { key: "bodyattack" },
  { key: "bodybalance" },
  { key: "box" },
  { key: "hiit the cage" },
  { key: "hiit the zone" },
  { key: "hiit full body" },
  { key: "run interval" },
];

module.exports = { User, Gyms, Workouts };
