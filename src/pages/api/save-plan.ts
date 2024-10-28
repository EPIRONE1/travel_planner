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

    const { days, title, planId } = req.body;

    // 새로운 문서 생성을 위한 전체 데이터 구조
    const travelPlanData: Partial<ITravelPlan> = {
      userId: session.user.id,
      title: title || `여행 계획 ${Date.now()}`,
      days: days.map(day => ({
        _id: undefined, // _id 필드 제거
        title: day.title,
        activities: day.activities.map(activity => ({
          _id: undefined, // _id 필드 제거
          place: activity.place || '',
          time: activity.time || '',
          period: activity.period || 'AM',
          activity: activity.activity || ''
        }))
      })),
      isShared: false,
      creator: session.user.name || '익명',
      destination: '',
      likes: 0,
      views: 0,
      likedBy: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let plan;
    if (planId) {
      // 기존 플랜 업데이트 시 필요한 필드만 업데이트
      const updateData = {
        title: travelPlanData.title,
        days: travelPlanData.days,
        updatedAt: new Date(),
        // 기존 필드가 없는 경우를 위한 기본값 설정
        destination: undefined,
        likes: undefined,
        views: undefined,
        likedBy: undefined,
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
            destination: '',
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