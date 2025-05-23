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
    const sort = req.query.sort as string || 'recent';
    
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

    // 정렬 조건 설정
    let sortOptions: any = {};
    switch (sort) {
      case 'likes':
        sortOptions = { likes: -1, createdAt: -1 };
        break;
      case 'views':
        sortOptions = { views: -1, createdAt: -1 };
        break;
      default: // 'recent'
        sortOptions = { createdAt: -1 };
    }

    const total = await TravelPlan.countDocuments(query);
    
    const plans = await TravelPlan.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('title days creator createdAt likes views likedBy destination numberOfPeople')
      .lean();

    const plansWithLikeStatus = plans.map(plan => ({
      ...plan,
      isLiked: userId ? (plan.likedBy || []).includes(userId) : false,
      numberOfPeople: plan.numberOfPeople || 1,
      destination: plan.destination || '여행지 미정',
      likes: plan.likes || 0,
      views: plan.views || 0,
      likedBy: undefined
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