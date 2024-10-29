"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import  Header from '@/components/ui/Header';
import { MapPin, Calendar, Compass, Users } from 'lucide-react';

const MainPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <Header />

      {/* Hero Content */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            여행 계획을 더 쉽고 스마트하게
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            당신의 완벽한 여행을 위한 스마트한 플래너. 
            목적지 선택부터 일정 관리까지, 모든 여행 계획을 한 곳에서 관리하세요.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => router.push('/create_plan')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
            >
              여행 계획 만들기
            </Button>
            <Button 
              onClick={() => router.push('/Explore')}
              variant="outline"
              className="px-8 py-6 text-lg"
            >
              다른 계획 둘러보기
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6">
              <CardContent className="space-y-4 pt-6">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold text-center">쉬운 장소 선택</h3>
                <p className="text-gray-600 text-center">
                  지도에서 클릭 한 번으로 방문할 장소를 선택하고 일정에 추가하세요
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="space-y-4 pt-6">
                <Calendar className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold text-center">스마트한 일정 관리</h3>
                <p className="text-gray-600 text-center">
                  간편하게 일정을 조정하고 관리하세요
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="space-y-4 pt-6">
                <Users className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold text-center">계획 공유</h3>
                <p className="text-gray-600 text-center">
                  다른 여행자들과 계획을 공유하고 영감을 얻으세요
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="space-y-4 pt-6">
                <Compass className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold text-center">여행 탐색</h3>
                <p className="text-gray-600 text-center">
                  다른 여행자들의 계획을 둘러보고 새로운 아이디어를 발견하세요
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            지금 바로 여행 계획을 시작하세요
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            무료로 제공되는 모든 기능을 이용해 당신만의 특별한 여행을 계획하세요
          </p>
          <Button 
            onClick={() => router.push('/create_plan')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            무료로 시작하기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Travel Planner</h3>
            <p className="text-gray-400">
              당신의 모든 여행 계획을 더 스마트하게
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">주요 기능</h4>
            <ul className="space-y-2 text-gray-400">
              <li>여행 계획 만들기</li>
              <li>일정 관리</li>
              <li>계획 공유</li>
              <li>다른 계획 둘러보기</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">바로가기</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white">홈</Link></li>
              <li><Link href="/Explore" className="hover:text-white">탐색하기</Link></li>
              <li><Link href="/create_plan" className="hover:text-white">계획 만들기</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">문의</h4>
            <p className="text-gray-400">
              문의사항이 있으시다면 언제든 연락주세요
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;