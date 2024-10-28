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

    const { days, title, destination, numberOfPeople, planId } = req.body;

    if (!title) {
      return res.status(400).json({ message: '계획 이름을 입력해주세요.' });
    }

    console.log('Received share plan request:', { 
      title, 
      destination, 
      numberOfPeople 
    }); // 디버깅용 로그

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
      destination: destination || '', // 명시적으로 destination 설정
      numberOfPeople: numberOfPeople || 1,
      likes: 0,
      views: 0,
      likedBy: [],
      updatedAt: new Date()
    };

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
      plan = await TravelPlan.create({
        ...sharedPlanData,
        createdAt: new Date()
      });
    }

    console.log('Saved plan:', plan); // 디버깅용 로그

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