// src/pages/api/share-plan.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { connectDB } from "@/lib/mongoose";
import TravelPlan from "@/models/TravelPlan";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 데이터베이스 연결 확인
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { days, title, numberOfPeople, destination, planId } = req.body;
    
    console.log('API received data:', {
      title,
      numberOfPeople,
      destination,
      planId
    });

    // 명시적 숫자 변환 및 유효성 검사
    const parsedNumberOfPeople = parseInt(String(numberOfPeople), 10);
    
    if (isNaN(parsedNumberOfPeople) || parsedNumberOfPeople < 1) {
      return res.status(400).json({ 
        message: '유효하지 않은 여행 인원수입니다.',
        received: numberOfPeople,
        parsed: parsedNumberOfPeople
      });
    }

    const sharedPlanData = {
      userId: session.user.id,
      title,
      days,
      isShared: true,
      creator: session.user.name || '익명',
      destination: destination || '',
      numberOfPeople: parsedNumberOfPeople,
      likes: 0,
      views: 0,
      likedBy: [],
      updatedAt: new Date()
    };

    console.log('Attempting to save plan with data:', {
      ...sharedPlanData,
      numberOfPeople: parsedNumberOfPeople
    });

    let plan;
    if (planId) {
      console.log('Updating existing plan:', planId);
      plan = await TravelPlan.findOneAndUpdate(
        { _id: planId, userId: session.user.id },
        { 
          $set: {
            ...sharedPlanData,
            numberOfPeople: parsedNumberOfPeople
          }
        },
        { 
          new: true,
          runValidators: true
        }
      );
    } else {
      console.log('Creating new plan');
      plan = await TravelPlan.create(sharedPlanData);
    }

    console.log('Plan saved successfully:', {
      id: plan._id,
      numberOfPeople: plan.numberOfPeople
    });

    return res.status(200).json({
      message: '플랜이 공유되었습니다.',
      planId: plan._id,
      savedNumberOfPeople: plan.numberOfPeople
    });

  } catch (error) {
    console.error('Share plan error:', error);
    return res.status(500).json({
      message: '공유 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}