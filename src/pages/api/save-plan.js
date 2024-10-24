import { getSession } from "next-auth/react";
import TravelPlan from '../../models/TravelPlan'; // 모델 경로에 맞게 조정하세요
import dbConnect from '../../lib/dbConnect'; // MongoDB 연결 함수

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await dbConnect();

  try {
    const { days } = req.body;

    // 사용자의 이메일을 기반으로 저장
    const newPlan = await TravelPlan.findOneAndUpdate(
      { userEmail: session.user.email }, // 이메일로 고유한 여행 계획 찾기
      { userEmail: session.user.email, days }, // 없으면 새로 생성
      { upsert: true, new: true }
    );

    res.status(200).json({ message: '여행 계획이 저장되었습니다!', plan: newPlan });
  } catch (error) {
    console.error("Error saving plan:", error);
    res.status(500).json({ error: "저장 중 오류 발생" });
  }
}
