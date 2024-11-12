//get-plan-detail.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import TravelPlan from "@/models/TravelPlan";
import { connectDB } from "@/lib/mongoose";

// Define interfaces for type safety
interface SessionUser {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
}

interface Session {
  user?: SessionUser;
  expires: string;
}

interface TravelPlanDocument {
  _id: string;
  userId: string;
  title: string;
  days: any[];
  creator: string;
  createdAt: Date;
  likes: number;
  views: number;
  destination: string;
  numberOfPeople: number;
  likedBy: string[];
  isShared?: boolean;
}

// 세션별 조회 기록을 저장할 Map
const viewedPlans = new Map<string, Set<string>>();

// 24시간마다 viewedPlans 초기화
setInterval(() => {
  viewedPlans.clear();
}, 24 * 60 * 60 * 1000);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { planId } = req.query;
    
    if (!planId || typeof planId !== 'string') {
      return res.status(400).json({ message: '플랜 ID가 필요합니다.' });
    }

    const session = await getServerSession(req, res, authOptions) as Session | null;
    const userId = session?.user?.id || 'anonymous';

    // 메인 플랜 조회
    const mainPlan = await TravelPlan.findById(planId)
      .select('_id userId title days creator createdAt likes views destination numberOfPeople likedBy')
      .lean() as TravelPlanDocument;

    if (!mainPlan) {
      return res.status(404).json({ message: '플랜을 찾을 수 없습니다.' });
    }

    // 조회수 증가 로직
    const sessionKey = `${userId}-${req.headers['user-agent']}`; // 사용자와 브라우저 정보로 세션키 생성
    const viewedSet = viewedPlans.get(planId) || new Set();

    // 이 세션에서 처음 보는 경우에만 조회수 증가
    if (!viewedSet.has(sessionKey)) {
      await TravelPlan.findByIdAndUpdate(
        planId,
        { $inc: { views: 1 } },
        { new: true }
      );
      
      viewedSet.add(sessionKey);
      viewedPlans.set(planId, viewedSet);
      
     }

    // 같은 사용자의 다른 플랜들 조회
    const userOtherPlans = await TravelPlan.find({
      userId: mainPlan.userId,
      _id: { $ne: planId },
      isShared: true
    })
    .select('title days creator createdAt likes views destination numberOfPeople likedBy')
    .lean() as TravelPlanDocument[];

    // 다른 사용자들의 플랜 조회
    const otherPlans = await TravelPlan.find({
      userId: { $ne: mainPlan.userId },
      isShared: true
    })
    .select('title days creator createdAt likes views destination numberOfPeople likedBy')
    .limit(5)
    .lean() as TravelPlanDocument[];

    // 좋아요 상태 확인
    const isLiked = userId ? mainPlan.likedBy?.includes(userId) : false;

    // 응답 데이터 구성
    const responseData = {
      mainPlan: {
        ...mainPlan,
        isLiked,
        likedBy: undefined
      },
      userOtherPlans: userOtherPlans.map(plan => ({
        ...plan,
        isLiked: userId ? plan.likedBy?.includes(userId) : false,
        likedBy: undefined
      })),
      otherPlans: otherPlans.map(plan => ({
        ...plan,
        isLiked: userId ? plan.likedBy?.includes(userId) : false,
        likedBy: undefined
      }))
    };

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('플랜 상세 조회 중 오류:', error);
    return res.status(500).json({
      message: '플랜을 불러오는 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}