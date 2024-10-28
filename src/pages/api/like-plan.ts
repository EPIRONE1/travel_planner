// src/pages/api/like-plan.ts

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

    const { planId } = req.body;
    const userId = session.user.id;

    const plan = await TravelPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: '플랜을 찾을 수 없습니다.' });
    }

    // likedBy 배열이 없으면 초기화
    if (!Array.isArray(plan.likedBy)) {
      plan.likedBy = [];
    }

    const hasLiked = plan.likedBy.includes(userId);

    let updatedPlan;
    if (hasLiked) {
      // 좋아요 취소
      updatedPlan = await TravelPlan.findByIdAndUpdate(
        planId,
        {
          $pull: { likedBy: userId },
          $inc: { likes: -1 }
        },
        { new: true }
      );
    } else {
      // 좋아요 추가
      updatedPlan = await TravelPlan.findByIdAndUpdate(
        planId,
        {
          $addToSet: { likedBy: userId },
          $inc: { likes: 1 }
        },
        { new: true }
      );
    }

    return res.status(200).json({
      message: hasLiked ? '좋아요가 취소되었습니다.' : '좋아요가 추가되었습니다.',
      liked: !hasLiked,
      likes: updatedPlan?.likes || 0
    });

  } catch (error) {
    console.error('좋아요 처리 중 오류:', error);
    return res.status(500).json({ message: '좋아요 처리 중 오류가 발생했습니다.' });
  }
}