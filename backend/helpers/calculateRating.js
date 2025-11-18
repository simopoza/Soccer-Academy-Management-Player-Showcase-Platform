
const calculateRating = (minutes, goalsScored, assistsProvided) => {
  // If player didn't play (0 minutes), return minimum rating
  if (minutes === 0) {
    return { rating: 0.0, goals: 0, assists: 0 };
  }
    
  // Base rating starts at 5.0 (out of 10)
  let rating = 5.0;
    
  // Calculate per-minute impact
  const minutesPlayedRatio = Math.min(minutes / 90, 1.0); // Normalize to 90 minutes max
  
  // Goals contribute more to rating (1.5 points per goal, scaled by minutes)
  const goalContribution = (goalsScored * 1.5) * minutesPlayedRatio;
  
  // Assists contribute to rating (1.0 point per assist, scaled by minutes)
  const assistContribution = (assistsProvided * 1.0) * minutesPlayedRatio;
  
  // Playing time bonus: small bonus for playing more minutes
  const playTimeBonus = minutesPlayedRatio * 0.5;
  
  // Calculate final rating
  rating = rating + goalContribution + assistContribution + playTimeBonus;
  
  // Cap the rating between 0.0 and 10.0
  rating = Math.max(0.0, Math.min(10.0, rating));
  
  // Round to 1 decimal place
  return Math.round(rating * 10) / 10;
}

module.exports = calculateRating;
