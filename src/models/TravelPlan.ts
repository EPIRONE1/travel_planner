import { Schema, model, Document, models } from 'mongoose';

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
  createdAt: Date;
  updatedAt: Date;
  destination?: string;    // 추가: 여행 목적지
  likes: number;          // 추가: 좋아요 수
  views: number;          // 추가: 조회수
  likedBy: string[];     // 추가: 좋아요한 사용자들의 ID
  numberOfPeople?: number;    // 추가: 여행 인원 수
  destination?: string;       // 기존 필드 활용
}

const ActivitySchema = new Schema<IActivity>({
  place: String,
  time: String,
  period: String,
  activity: String,
  numberOfPeople: {
    type: Number,
    default: 1
  },
  destination: {
    type: String,
    default: ''
  }
});

const DaySchema = new Schema<IDay>({
  title: String,
  activities: [ActivitySchema],
});

const TravelPlanSchema = new Schema<ITravelPlan>({
  userId: String,
  title: {
    type: String,
    default: function() {
      return `여행 계획 ${Date.now()}`;
    }
  },
  days: [DaySchema],
  isShared: {
    type: Boolean,
    default: false
  },
  creator: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  destination: {          // 추가
    type: String,
    default: ''
  },
  likes: {               // 추가
    type: Number,
    default: 0
  },
  views: {               // 추가
    type: Number,
    default: 0
  },
  likedBy: {            // 추가
    type: [String],
    default: []
  }
});

TravelPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default models.TravelPlan || model<ITravelPlan>('TravelPlan', TravelPlanSchema);