'use client'

import Link from "next/link"
import './explore.css';
import { useState } from 'react'
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Calendar, Globe, Users, Heart } from "lucide-react"

const initialTravelPlans = [
  { id: 1, title: "도쿄 3일 여행", destination: "일본", duration: "3일", creator: "김여행", likes: 120 },
  { id: 2, title: "파리 로맨틱 주말", destination: "프랑스", duration: "2일", creator: "이파리", likes: 89 },
  { id: 3, title: "뉴욕 문화 탐방", destination: "미국", duration: "5일", creator: "박뉴욕", likes: 156 },
  { id: 4, title: "제주도 힐링 여행", destination: "한국", duration: "4일", creator: "최제주", likes: 201 },
  { id: 5, title: "방콕 맛집 투어", destination: "태국", duration: "3일", creator: "정방콕", likes: 95 },
  { id: 6, title: "시드니 오페라하우스 투어", destination: "호주", duration: "1일", creator: "호주매니아", likes: 78 },
]

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [travelPlans, setTravelPlans] = useState(initialTravelPlans)
  const [likedPlans, setLikedPlans] = useState<number[]>([])

  const filteredPlans = travelPlans.filter(plan => 
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.destination.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLike = (id: number) => {
    setTravelPlans(plans =>
      plans.map(plan =>
        plan.id === id ? { ...plan, likes: plan.likes + (likedPlans.includes(id) ? -1 : 1) } : plan
      )
    )
    setLikedPlans(liked =>
      liked.includes(id) ? liked.filter(planId => planId !== id) : [...liked, id]
    )
  }

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
                <Link href="#" prefetch={false} className="mainpage-link">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="create_plan" prefetch={false} className="mainpage-link">
                  Create
                </Link>
              </li>
              <li>
                <Link href="#" prefetch={false} className="mainpage-link">
                  About
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

        <div className="travel-plans-grid">
          {filteredPlans.map(plan => (
            <Card key={plan.id} className="travel-card">
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="travel-detail">
                  <Globe className="icon" />
                  <span>{plan.destination}</span>
                </div>
                <div className="travel-detail">
                  <Calendar className="icon" />
                  <span>{plan.duration}</span>
                </div>
                <div className="travel-detail">
                  <Avatar className="avatar">
                    <AvatarFallback>{plan.creator[0]}</AvatarFallback>
                  </Avatar>
                  <span>{plan.creator}</span>
                </div>
              </CardContent>
              <CardFooter className="card-footer">
                <Button variant="outline" className="view-button">자세히 보기</Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`like-button ${likedPlans.includes(plan.id) ? 'liked' : ''}`}
                  onClick={() => handleLike(plan.id)}
                  aria-label={`좋아요 ${plan.likes}개`}
                  aria-pressed={likedPlans.includes(plan.id)}
                >
                  <Heart className="heart-icon" />
                  <span className="likes-count">{plan.likes}</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <p className="no-results">검색 결과가 없습니다.</p>
        )}

        <div className="pagination">
          <Button variant="outline" className="prev-button">이전</Button>
          <Button variant="outline" className="next-button">다음</Button>
        </div>
      </div>
    </div>
  )
}
