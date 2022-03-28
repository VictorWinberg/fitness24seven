const Day = {
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6,
}

const User = {
    "VW": "USER_VW",
    "AO": "USER_AO",
    "AG": "USER_AG",
    "CS": "USER_CS",
}

const Gym = {
    "lilla torg": { var: "malmo-lilla-torg", name: "Malmö Lilla Torg" },
    "dalaplan": { var: "malmoe-dalaplan", name: "Malmö Dalaplan" },
    "katrinelund": { var: "malmoe-katrinelund", name: "Malmö Katrinelund" },
    "värnhem": { var: "malmoe-vaernhem", name: "Malmö Värnhem" },
}

const Workout = {
    "bodypump": { var: "bodypump", name: "BODYPUMP®" },
    "bodystep": { var: "bodystep", name: "BODYSTEP®" },
    "bodycombat": { var: "bodycombat", name: "BODYCOMBAT®" },
    "bodyattack": { var: "bodyattack", name: "BODYATTACK®" },
    "bodybalance": { var: "bodybalance", name: "BODYBALANCE®" },
    "box": { var: "box", name: "BOX" },
}

module.exports = { Day, User, Gym, Workout }