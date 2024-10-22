// // pages/api/save-plan.js

// import dbConnect from '../../lib/mongodb';
// import TravelPlan from '../../models/TravelPlan';

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     try {
//       // MongoDB에 연결
//       await dbConnect();
      
//       // 요청 본문에서 여행 계획 데이터를 가져옴
//       const { days } = req.body;

//       // 여행 계획을 MongoDB에 저장
//       const newPlan = new TravelPlan({ days });
//       await newPlan.save();

//       // 저장 성공 응답
//       res.status(200).json({ message: 'Travel plan saved successfully!' });
//     } catch (error) {
//       console.error('Error saving travel plan:', error);
//       res.status(500).json({ message: 'Internal Server Error', error: error.message });
//     }
//   } else {
//     // 다른 메소드가 호출되었을 때의 처리
//     res.status(405).json({ message: 'Method Not Allowed' });
//   }
// }

import { getSession } from 'next-auth/react';
import dbConnect from '../../lib/mongodb';
import TravelPlan from '../../models/TravelPlan';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      // MongoDB에 연결
      await dbConnect();

      // 요청 본문에서 여행 계획 데이터를 가져옴
      const { days } = req.body;

      // 로그인한 사용자의 이메일과 함께 여행 계획을 저장
      const newPlan = new TravelPlan({
        userEmail: session.user.email,  // 사용자의 이메일 저장
        days,
      });
      await newPlan.save();

      res.status(200).json({ message: 'Travel plan saved successfully!' });
    } catch (error) {
      console.error('Error saving travel plan:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
