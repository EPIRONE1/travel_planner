// src/models/TravelPlan.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

interface IActivity {
  place: string;
  time: string;
  period: string;
  activity: string;
}

interface IDay {
  title: string;
  activities: IActivity[];
}

export interface ITravelPlan extends Document {
  userId: string;
  title: string;
  days: IDay[];
  isShared: boolean;
  creator: string;
  destination: string;
  numberOfPeople: number;
  likes: number;
  views: number;
  likedBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema({
  place: { type: String, default: '' },
  time: { type: String, default: '' },
  period: { type: String, default: 'AM' },
  activity: { type: String, default: '' }
});

const DaySchema = new Schema({
  title: { type: String, required: true },
  activities: [ActivitySchema]
});

const TravelPlanSchema = new Schema<ITravelPlan>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  days: [DaySchema],
  isShared: { type: Boolean, default: false },
  creator: { type: String, required: true },
  destination: { type: String, default: '' },
  numberOfPeople: { 
    type: Number, 
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: '여행 인원은 정수여야 합니다.'
    }
  },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 업데이트 시 updatedAt 자동 갱신
TravelPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

TravelPlanSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 모델이 이미 컴파일되었는지 확인하고, 없는 경우에만 새로 생성
export default mongoose.models.TravelPlan || mongoose.model<ITravelPlan>('TravelPlan', TravelPlanSchema);