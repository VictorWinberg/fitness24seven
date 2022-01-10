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
    "Lilla_Torg": { var: "malmo-lilla-torg", name: "Malmö Lilla Torg" },
    "Dalaplan": { var: "malmoe-dalaplan", name: "Malmö Dalaplan" },
    "Katrinelund": { var: "malmoe-katrinelund", name: "Malmö Katrinelund" },
    "Varnhem": { var: "malmoe-vaernhem", name: "Malmö Värnhem" },
}

const Workout = {
    "Bodypump": { var: "bodypump", name: "BODYPUMP®" },
    "Bodystep": { var: "bodystep", name: "BODYSTEP®" },
    "Bodycombat": { var: "bodycombat", name: "BODYCOMBAT®" },
    "Bodyattack": { var: "bodyattack", name: "BODYATTACK®" },
    "Box": { var: "box", name: "BOX" },
}

module.exports = { Day, User, Gym, Workout }