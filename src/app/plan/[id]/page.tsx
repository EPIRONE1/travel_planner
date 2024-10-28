// src/app/plan/[id]/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Calendar, Users, Globe, Activity, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Activity {
  place: string;
  time: string;
  period: string;
  activity: string;
}

interface Day {
  title: string;
  activities: Activity[];
}

interface Plan {
  _id: string;
  title: string;
  days: Day[];
  creator: string;
  createdAt: string;
  likes: number;
  views: number;
  destination: string;
  numberOfPeople: number;
  isLiked: boolean;
}

interface PlanDetail {
  mainPlan: Plan;
  userOtherPlans: Plan[];
  otherPlans: Plan[];
}

export default function PlanDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [planDetail, setPlanDetail] = useState<PlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlanDetail();
  }, [params.id]);

  const fetchPlanDetail = async () => {
    try {
      const response = await fetch(`/api/get-plan-detail?planId=${params.id}`);
      if (!response.ok) {
        throw new Error('플랜을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setPlanDetail(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (planId: string) => {
    if (!session) {
      alert('좋아요를 하려면 로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/like-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error('좋아요 처리에 실패했습니다.');
      }

      const data = await response.json();
      // 메인 플랜이나 다른 플랜의 좋아요 상태 업데이트
      fetchPlanDetail();

    } catch (error) {
      console.error('Error liking plan:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) return <div className="text-center py-8">로딩 중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!planDetail) return <div className="text-center py-8">플랜을 찾을 수 없습니다.</div>;

  const { mainPlan, userOtherPlans, otherPlans } = planDetail;

  const PlanCard = ({ plan }: { plan: Plan }) => (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-lg truncate">{plan.title}</span>
          <Button
            variant="ghost"
            size="icon"
            className={`like-button ${plan.isLiked ? 'liked' : ''}`}
            onClick={() => handleLike(plan._id)}
          >
            <Heart className={`h-5 w-5 ${plan.isLiked ? 'text-red-500 fill-red-500' : ''}`} />
            <span className="ml-2">{plan.likes}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{plan.days.length}일</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{plan.numberOfPeople}명</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="truncate">{plan.destination || '여행지 미정'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>{plan.views} 조회</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => router.push(`/plan/${plan._id}`)}
        >
          자세히 보기
        </Button>
      </CardContent>
    </Card>
  );

return (
  <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-8">
      <Link href="/explore" className="text-blue-600 hover:underline">
        ← 목록으로 돌아가기
      </Link>
    </div>

    {/* 메인 플랜 표시 */}
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{mainPlan.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className={`like-button ${mainPlan.isLiked ? 'liked' : ''}`}
            onClick={() => handleLike(mainPlan._id)}
          >
            <Heart className={`h-6 w-6 ${mainPlan.isLiked ? 'text-red-500 fill-red-500' : ''}`} />
            <span className="ml-2">{mainPlan.likes}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span>{mainPlan.days.length}일</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            <span>{mainPlan.numberOfPeople}명</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-500" />
            <span>{mainPlan.destination || '여행지 미정'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-500" />
            <span>조회수: {mainPlan.views}</span>
          </div>
        </div>

        <div className="space-y-8">
          {mainPlan.days.map((day, dayIndex) => (
            <div key={dayIndex} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">{day.title}</h3>
              <div className="space-y-4">
                {day.activities.map((activity, activityIndex) => (
                  <div key={activityIndex} className="bg-gray-50 p-4 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{activity.place || '장소 미정'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>
                          {activity.time} {activity.period}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-gray-700">{activity.activity || '활동 미정'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>작성자: {mainPlan.creator}</p>
          <p>작성일: {new Date(mainPlan.createdAt).toLocaleDateString('ko-KR')}</p>
        </div>
      </CardContent>
    </Card>

    {/* 같은 작성자의 다른 플랜들 */}
    {userOtherPlans.length > 0 && (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">작성자의 다른 여행 계획</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userOtherPlans.map(plan => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </div>
      </div>
    )}

    {/* 다른 사용자들의 플랜 */}
    {otherPlans.length > 0 && (
      <div>
        <h2 className="text-xl font-bold mb-4">다른 여행 계획 둘러보기</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherPlans.map(plan => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </div>
      </div>
    )}
  </div>
);
}