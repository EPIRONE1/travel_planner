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
  userEmail: { type: String, required: true }, // 사용자 이메일을 추가하여 고유하게 관리
  days: [DaySchema],
});

export default mongoose.models.TravelPlan || mongoose.model('TravelPlan', TravelPlanSchema);
