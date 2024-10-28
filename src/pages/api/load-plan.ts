// src/pages/api/load-plan.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import TravelPlan from "@/models/TravelPlan";
import { connectDB } from "@/lib/mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = session.user.id;

    const userPlans = await TravelPlan.find({ userId })
      .sort({ updatedAt: -1 })
      .select('title days createdAt updatedAt')
      .lean()
      .exec();

    return res.status(200).json({
      plans: userPlans,
      message: userPlans.length ? 'Plans loaded successfully' : 'No plans found'
    });

  } catch (error) {
    console.error('Load plans error:', error);
    return res.status(500).json({
      message: 'Failed to load plans',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// API route 설정
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};