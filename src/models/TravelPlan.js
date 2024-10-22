import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  place: String,
  time: String,
  period: String,
  activity: String,
});

const DaySchema = new mongoose.Schema({
  title: String,
  activities: [ActivitySchema],
});

const TravelPlanSchema = new mongoose.Schema({
  days: [DaySchema],
});

export default mongoose.models.TravelPlan || mongoose.model('TravelPlan', TravelPlanSchema);
