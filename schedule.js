module.exports = ({ schedule, Day, User, Workout, Gym }) => {
  // schedule(Day.Monday, "18", "00", User.X, Workout.Bodypump, Gym.Katrinelund);
  // schedule(Day.Monday, "20", "00", User.X, Workout.Bodypump, Gym.Dalaplan);

  //schedule(Day.Tuesday, "17", "00", User.CS, Workout.Bodystep, Gym.Dalaplan);

  schedule(Day.Wednesday, "06", "30", User.VW, Workout.Bodypump, Gym.Lilla_Torg);
  schedule(Day.Wednesday, "06", "30", User.AO, Workout.Bodypump, Gym.Lilla_Torg);
  schedule(Day.Wednesday, "18", "10", User.VW, Workout.Box, Gym.Lilla_Torg);
  // schedule(Day.Wednesday, "06", "30", User.AG, Workout.Bodypump, Gym.Lilla_Torg);

  schedule(Day.Thursday, "18", "20", User.VW, Workout.Box, Gym.Lilla_Torg);
  schedule(Day.Thursday, "18", "20", User.AO, Workout.Box, Gym.Lilla_Torg);
  // schedule(Day.Thursday, "18", "00", User.CS, Workout.Bodystep, Gym.Dalaplan);

  // schedule(Day.Saturday, "12", "15", User.CS, Workout.Bodystep, Gym.Varnhem);

  // schedule(Day.Sunday, "10", "00", User.X, Workout.Bodypump, Gym.Lilla_Torg);
  // schedule(Day.Sunday, "10", "00", User.X, Workout.Bodypump, Gym.Lilla_Torg);
};
