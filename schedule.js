module.exports = (schedule, Day, User, Gym) => {
  // schedule(Day.Monday, "18", "00", User.X, Gym.Katrinelund);
  // schedule(Day.Monday, "20", "00", User.X, Gym.Dalaplan);
  
  schedule(Day.Tuesday, "17", "00", User.CS, Gym.Dalaplan);

  schedule(Day.Wednesday, "06", "30", User.VW, Gym.Lilla_Torg);
  schedule(Day.Wednesday, "06", "30", User.AO, Gym.Lilla_Torg);
  // schedule(Day.Wednesday, "06", "30", User.AG, Gym.Lilla_Torg);

  // schedule(Day.Wednesday, "06", "30", User.X, Gym.Lilla_Torg);
  // schedule(Day.Wednesday, "18", "15", User.X, Gym.Dalaplan);

  schedule(Day.Thursday, "12", "00", User.VW, Gym.Lilla_Torg);
  schedule(Day.Thursday, "12", "00", User.AO, Gym.Lilla_Torg);
  // schedule(Day.Thursday, "18", "00", User.X, Gym.Katrinelund);
  // schedule(Day.Thursday, "19", "00", User.X, Gym.Lilla_Torg);
  schedule(Day.Thursday, "18", "00", User.CS, Gym.Dalaplan);

  // schedule(Day.Saturday, "10", "00", User.X, Gym.Lilla_Torg);
  // schedule(Day.Saturday, "10", "00", User.X, Gym.Lilla_Torg);
    schedule(Day.Saturday, "10", "00", User.CS, Gym.Lilla_Torg);
    schedule(Day.Saturday, "12", "15", User.CS, Gym.Varnhem);

  

  // schedule(Day.Sunday, "10", "00", User.X, Gym.Lilla_Torg);
  // schedule(Day.Sunday, "10", "00", User.X, Gym.Lilla_Torg);
};
