// models/TravelPlan.js

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

// 명시적으로 컬렉션 이름을 'travelplans'로 지정합니다.
const TravelPlan = mongoose.models.TravelPlan || mongoose.model('TravelPlan', TravelPlanSchema, 'travelplans');

export default TravelPlan;