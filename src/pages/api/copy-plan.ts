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
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    await connectDB();
    const { planId } = req.body;

    // 원본 계획 조회
    const originalPlan = await TravelPlan.findById(planId).lean() as any;
    if (!originalPlan) {
      return res.status(404).json({ message: '플랜을 찾을 수 없습니다.' });
    }

    // 새로운 계획 생성
    const newPlan = new TravelPlan({
      userId: session.user.id,
      title: `${originalPlan.title} (복사본)`,
      days: originalPlan.days,
      isShared: false,
      creator: session.user.name || 'Unknown User',
      destination: originalPlan.destination,
      numberOfPeople: originalPlan.numberOfPeople,
      likes: 0,
      views: 0,
      likedBy: []
    });

    await newPlan.save();

    return res.status(200).json({
      message: '플랜이 성공적으로 복사되었습니다.',
      planId: newPlan._id
    });

  } catch (error) {
    console.error('플랜 복사 중 오류:', error);
    return res.status(500).json({
      message: '플랜을 복사하는 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}