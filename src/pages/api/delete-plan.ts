// pages/api/delete-plan.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import TravelPlan from "@/models/TravelPlan";
import { connectDB } from "@/lib/mongoose";

type DeleteResponse = {
  message: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteResponse>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { planId } = req.query;
    
    // planId 타입 검증
    if (!planId || typeof planId !== 'string') {
      return res.status(400).json({ message: 'Invalid plan ID' });
    }

    // 사용자의 플랜인지 확인하고 삭제
    const deletedPlan = await TravelPlan.findOneAndDelete({
      _id: planId,
      userId: session.user.id
    });

    if (!deletedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    return res.status(200).json({ message: 'Plan deleted successfully' });

  } catch (error) {
    console.error('Delete plan error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// types/next-auth.d.ts에 추가할 타입 정의
declare module "next-auth" {
  interface Session {
    User: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    }
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
}