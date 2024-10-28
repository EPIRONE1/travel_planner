// src/pages/api/get-shared-plans.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import TravelPlan from "@/models/TravelPlan";
import { connectDB } from "@/lib/mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const searchQuery = search ? {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;

    const query = {
      isShared: true,
      ...searchQuery
    };

    const total = await TravelPlan.countDocuments(query);

    // select 문에 필요한 모든 필드를 명시적으로 포함
    const plans = await TravelPlan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title days creator createdAt likes likedBy destination numberOfPeople')
      .lean();

    const plansWithLikeStatus = plans.map(plan => ({
      ...plan,
      isLiked: userId ? (plan.likedBy || []).includes(userId) : false,
      destination: plan.destination || '여행지 미정',  // 빈 문자열 대신 기본값 설정
      numberOfPeople: plan.numberOfPeople || 1,
      likes: plan.likes || 0,
      likedBy: undefined // 클라이언트에 likedBy 배열 노출 방지
    }));

    return res.status(200).json({
      plans: plansWithLikeStatus,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        hasMore: skip + plans.length < total
      }
    });

  } catch (error) {
    console.error('공유된 플랜 조회 중 오류:', error);
    return res.status(500).json({ 
      message: '플랜을 불러오는 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}