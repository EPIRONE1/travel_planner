import connectToDatabase from '../../lib/mongodb';
import TravelPlan from '../../models/TravelPlan';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await connectToDatabase(); // MongoDB 연결

      const travelPlan = new TravelPlan(req.body); // 요청된 데이터로 새로운 문서 생성
      await travelPlan.save(); // MongoDB에 저장

      res.status(200).json({ message: 'Plan saved successfully!' });
    } catch (error) {
      console.error('Error saving plan:', error);
      res.status(500).json({ error: 'Failed to save plan.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
