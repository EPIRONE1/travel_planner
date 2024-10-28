// src/pages/api/share-plan.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import TravelPlan from "@/models/TravelPlan";
import { connectDB } from "@/lib/mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { days, title, numberOfPeople, destination, planId } = req.body;
    
    // 디버깅을 위한 로그
    console.log('Received data:', {
      title,
      numberOfPeople,
      destination,
      planId
    });

    if (!title) {
      return res.status(400).json({ message: '계획 이름을 입력해주세요.' });
    }

    const sharedPlanData = {
      userId: session.user.id,
      title,
      days: days.map(day => ({
        title: day.title,
        activities: day.activities.map(activity => ({
          place: activity.place || '',
          time: activity.time || '',
          period: activity.period || 'AM',
          activity: activity.activity || ''
        }))
      })),
      isShared: true,
      creator: session.user.name || '익명',
      destination: destination || '',
      numberOfPeople: Number(numberOfPeople) || 1, // 명시적으로 숫자로 변환
      likes: 0,
      views: 0,
      likedBy: [],
      updatedAt: new Date()
    };

    console.log('Saving plan with data:', sharedPlanData); // 디버깅

    let plan;
    if (planId) {
      const existingPlan = await TravelPlan.findById(planId);
      
      plan = await TravelPlan.findOneAndUpdate(
        { 
          _id: planId,
          userId: session.user.id
        },
        { 
          $set: {
            ...sharedPlanData,
            likes: existingPlan?.likes || 0,
            views: existingPlan?.views || 0,
            likedBy: existingPlan?.likedBy || []
          }
        },
        { 
          new: true,
          upsert: true 
        }
      );
    } else {
      plan = await TravelPlan.create(sharedPlanData);
    }

    console.log('Saved plan:', plan); // 디버깅

    return res.status(200).json({
      message: '플랜이 공유되었습니다.',
      planId: plan._id
    });

  } catch (error) {
    console.error('공유 중 오류:', error);
    return res.status(500).json({
      message: '공유 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}