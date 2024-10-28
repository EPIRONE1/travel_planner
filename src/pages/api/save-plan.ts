// src/pages/api/save-plan.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import TravelPlan, { ITravelPlan } from "@/models/TravelPlan";
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

    const { days, title, planId, numberOfPeople, destination } = req.body;

    // 데이터 로깅
    console.log('Received data:', { days, title, planId, numberOfPeople, destination });

    // 새로운 문서 생성을 위한 전체 데이터 구조
    const travelPlanData: Partial<ITravelPlan> = {
      userId: session.user.id,
      title: title || `여행 계획 ${Date.now()}`,
      days: days.map(day => ({
        _id: undefined,
        title: day.title,
        activities: day.activities.map(activity => ({
          _id: undefined,
          place: activity.place || '',
          time: activity.time || '',
          period: activity.period || 'AM',
          activity: activity.activity || ''
        }))
      })),
      isShared: false,
      creator: session.user.name || '익명',
      destination: destination || '',
      numberOfPeople: Number(numberOfPeople) || 1, // 명시적으로 숫자로 변환
      likes: 0,
      views: 0,
      likedBy: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Processed travel plan data:', travelPlanData); // 데이터 로깅

    let plan;
    if (planId) {
      // 기존 플랜 업데이트 시 필요한 필드만 업데이트
      const updateData = {
        title: travelPlanData.title,
        days: travelPlanData.days,
        destination: travelPlanData.destination,
        numberOfPeople: travelPlanData.numberOfPeople, // numberOfPeople 추가
        updatedAt: new Date()
      };

      plan = await TravelPlan.findOneAndUpdate(
        { 
          _id: planId,
          userId: session.user.id
        },
        { 
          $set: updateData,
          // 기존 필드가 없는 경우 초기값 설정
          $setOnInsert: {
            likes: 0,
            views: 0,
            likedBy: []
          }
        },
        { 
          new: true,
          upsert: true // 문서가 없으면 생성
        }
      );
    } else {
      // 새 플랜 생성
      const newPlan = new TravelPlan(travelPlanData);
      plan = await newPlan.save();
    }

    console.log('Saved plan:', plan); // 저장된 데이터 로깅

    return res.status(200).json({
      message: planId ? '플랜이 수정되었습니다.' : '플랜이 저장되었습니다.',
      planId: plan._id
    });

  } catch (error) {
    console.error('저장 중 오류:', error);
    return res.status(500).json({
      message: '저장 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}