import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/react";
import { Session } from 'next-auth';
import TravelPlan, { ITravelPlan } from '@/models/TravelPlan';
import { connectDB } from '@/lib/mongoose';

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  plans: Array<Pick<ITravelPlan, 'title' | '_id'>>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  const session: Session | null = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await connectDB();

  try {
    // 사용자의 이메일로 저장된 모든 계획을 불러옴
    const travelPlans = await TravelPlan.find(
      { userEmail: session.user.email },
      'planName _id'
    );
    
    res.status(200).json({ plans: travelPlans });
  } catch (error) {
    console.error("Error loading plans:", error);
    res.status(500).json({ error: "불러오기 중 오류 발생" });
  }
}