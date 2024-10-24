// src/pages/api/load-plan.js
import dbConnect from "@/lib/mongodb";
import TravelPlan from "@/models/TravelPlan";

export default async function handler(req, res) {
  try {
    await dbConnect(); // 데이터베이스 연결
    const travelPlans = await TravelPlan.find(); // 모든 여행 계획 가져오기
    
    if (travelPlans.length > 0) {
      res.status(200).json(travelPlans[0]); // 첫 번째 여행 계획 반환
    } else {
      res.status(404).json({ message: "여행 계획을 찾을 수 없습니다." });
    }
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다.", error });
  }
}
