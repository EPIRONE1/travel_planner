// src/app/explore/page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Globe, Users, Heart, Search, User, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "./explore.css";
import Header from "@/components/ui/Header";

interface Plan {
  _id: string;
  title: string;
  destination?: string;
  creator: string;
  createdAt: string;
  likes: number;
  views: number;
  isLiked: boolean;
  days: any[];
  numberOfPeople: number;
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
  const [sortBy, setSortBy] = useState("recent"); // "recent", "likes", "views"
  const plansPerPage = 6;

  const fetchSharedPlans = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: plansPerPage.toString(),
        sort: sortBy,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/get-shared-plans?${queryParams}`, {
        headers: {
          'Cache-Control': 'no-cache'
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
      alert('추천하려면 로그인이 필요합니다.');
      router.push('/social_login');
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
        throw new Error('추천 처리에 실패했습니다.');
      }

      const data = await response.json();
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
      alert('추천 처리 중 오류가 발생했습니다.');
    }
  };


  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1); // 정렬이나 검색어가 변경될 때 첫 페이지로 리셋
      fetchSharedPlans();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, currentPage, sortBy]);

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-2 pb-2 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">여행 계획 탐색하기</h2>
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="정렬 기준" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">최신순</SelectItem>
                    <SelectItem value="likes">추천순</SelectItem>
                    <SelectItem value="views">조회수순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Input 
                  placeholder="여행 계획 또는 목적지 검색..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-2"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedPlans.map(plan => (
                <Card key={plan._id} className="flex flex-col bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold line-clamp-1">
                      {plan.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{plan.destination}</p>
                  </CardHeader>
                  
                  <CardContent className="flex-1 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                        <span>{plan.days.length}일</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-blue-600" />
                        <span>{plan.numberOfPeople}명</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="h-4 w-4 mr-2 text-blue-600" />
                        <span>{plan.destination || '목적지'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="truncate">{plan.creator}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-4 mt-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{plan.views || 0}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Heart className="h-4 w-4 mr-1" />
                        <span>{plan.likes || 0}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t">
                    <div className="flex justify-between items-center w-full">
                      <Button
                        variant="outline"
                        onClick={() =>  router.push(`/plan/${plan._id}`)}
                        className="text-sm"
                        size="sm"
                      >
                        자세히 보기
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`flex items-center gap-2 transition-all duration-200 ${
                          plan.isLiked ? 'liked' : ''
                        }`}
                        onClick={() => handleLike(plan._id)}
                      >
                        <Heart
  className={`h-5 w-5 transition-all duration-200`}
  fill={plan.isLiked ? "#ef4444" : "none"}  // fill 속성 추가
  color={plan.isLiked ? "#ef4444" : "currentColor"}
/>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {sharedPlans.length === 0 && !isLoading && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              <div className="flex items-center px-4 bg-white rounded border">
                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExplorePage;