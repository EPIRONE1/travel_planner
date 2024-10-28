// src/app/explore/page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Calendar, Globe, Users, Heart } from "lucide-react";
import "./explore.css"

interface Plan {
  _id: string;
  title: string;
  destination?: string;
  creator: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  days: any[];
  numberOfPeople?: number; // 추가
}

const ExplorePage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sharedPlans, setSharedPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const plansPerPage = 6;

  const fetchSharedPlans = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: plansPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/get-shared-plans?${queryParams}`, {
        headers: {
          'Cache-Control': 'no-cache' // 캐시 비활성화
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch shared plans');
      }
      
      const data = await response.json();
      setSharedPlans(data.plans);
      setTotalPages(data.pagination.pages);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError(error instanceof Error ? error.message : '플랜을 불러오는데 실패했습니다.');
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

      // 좋아요 상태 즉시 업데이트
      setSharedPlans(prevPlans =>
        prevPlans.map(plan =>
          plan._id === planId
            ? {
                ...plan,
                likes: data.likes,
                isLiked: data.liked
              }
            : plan
        )
      );

    } catch (error) {
      console.error('Error liking plan:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  // 페이지 로드, 검색어 변경, 페이지 변경 시 플랜 목록 갱신
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSharedPlans();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, currentPage]);

  return (
    <div className="explore-container">
      <header className="mainpage-header">
        <div className="mainpage-header-content">
          <div>
            <h1 className="mainpage-title">Travel Planner</h1>
            <p className="mainpage-subtitle">Plan your dream vacation with ease</p>
          </div>
          <nav>
            <ul className="mainpage-nav">
              <li>
                <Link href="/" prefetch={false} className="mainpage-link">
                  Home
                </Link>
              </li>
              <li>
                <Link href="Explore" prefetch={false} className="mainpage-link">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="create_plan" prefetch={false} className="mainpage-link">
                  Create
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <div className="explore-content">
        <h1 className="explore-title">여행 계획 탐색하기</h1>
        
        <div className="search-box">
          <Input 
            placeholder="여행 계획 또는 목적지 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="travel-plans-grid">
            {sharedPlans.map(plan => (
              <Card key={plan._id} className="travel-card">
                <CardHeader>
                  <CardTitle>{plan.title}</CardTitle>
                </CardHeader>
                <CardContent>
  <div className="space-y-2">
    <div className="travel-detail">
      <Calendar className="icon" />
      <span>{plan.days.length}일</span>
    </div>
    <div className="travel-detail">
      <Users className="icon" />
      <span>{plan.numberOfPeople}명</span>
    </div>
    <div className="travel-detail">
      <Globe className="icon" />
      <span className="truncate">{plan.destination || '여행지 미정'}</span>
    </div>
    <div className="travel-detail">
      <Users className="icon" />
      <span>작성자: {plan.creator || '익명'}</span>
    </div>
  </div>
  <div className="mt-4 text-sm text-gray-500">
    작성일: {new Date(plan.createdAt).toLocaleDateString('ko-KR')}
  </div>
</CardContent>
                <CardFooter className="justify-between">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/plan/${plan._id}`)}
                    className="flex items-center gap-2"
                  >
                    자세히 보기
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`like-button ${plan.isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(plan._id)}
                  >
                    <Heart 
                      className={`heart-icon ${plan.isLiked ? 'text-red-500 fill-red-500' : ''}`}
                    />
                    <span className="likes-count">{plan.likes || 0}</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

{sharedPlans.length === 0 && !isLoading && (
          <p className="text-center py-8 text-gray-500">
            검색 결과가 없습니다.
          </p>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            <span className="flex items-center">
              {currentPage} / {totalPages}
            </span>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;