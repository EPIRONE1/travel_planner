// src/app/create_plan/page.tsx

"use client"

import MapComponent from "./ui/MapComponent"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ChevronUp, ChevronDown, Trash2, Save, Upload } from 'lucide-react'
import './styles/itinerary-planner.css'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Share2 } from 'lucide-react';

const SharePlanModal = ({ isOpen, onClose, onShare }) => {
  const [title, setTitle] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [destination, setDestination] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onShare({ 
      title,
      numberOfPeople,
      destination 
    });
    
    // 초기화
    setTitle("");
    setNumberOfPeople(1);
    setDestination("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">여행 계획 공유하기</h2>
          <p className="text-sm text-gray-500 mt-1">여행 계획의 상세 정보를 입력해주세요</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              계획 이름
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2024 여름 유럽 여행"
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              여행 장소
            </label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="예: 파리, 프랑스"
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              여행 인원
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="100"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                className="w-32"
                required
              />
              <span className="text-sm text-gray-500">명</span>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button"
              onClick={onClose}
              variant="outline"
            >
              취소
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              공유하기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SavePlanModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(title);
    setTitle("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">여행 계획 저장</h2>
          <p className="text-sm text-gray-500 mt-1">저장할 계획의 이름을 입력하세요</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2024 여름 유럽 여행"
              className="w-full"
              required
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button"
              onClick={onClose}
              variant="outline"
            >
              취소
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              저장
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 모달 컴포넌트 정의
const PlanSelectionModal = ({ isOpen, plans, onSelect, onClose, onUpdate, onRefresh }) => {
  const [editingPlan, setEditingPlan] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleDelete = async (planId) => {
    if (!confirm('정말로 이 여행 계획을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/delete-plan?planId=${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('여행 계획이 성공적으로 삭제되었습니다.');
        // 부모 컴포넌트의 새로고침 함수 호출
        onRefresh();
      } else {
        const errorData = await response.json();
        alert(`삭제 중 오류가 발생했습니다: ${errorData.message}`);
      }
    } catch (error) {
      console.error('삭제 중 오류:', error);
      alert('서버와 연결하는 중 오류가 발생했습니다.');
    }
  };
  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setEditTitle(plan.title || "");
  };
  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    
    await onUpdate(editingPlan._id, editTitle);
    setEditingPlan(null);
    setEditTitle("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 정보 없음';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '날짜 정보 없음';
      }
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '날짜 정보 없음';
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setEditingPlan(null);
      setEditTitle("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">저장된 여행 계획</h2>
          <p className="text-sm text-gray-500 mt-1">불러올 계획을 선택하거나 수정하세요</p>
        </div>
        
        <div className="space-y-3">
          {plans && plans.length > 0 ? (
            plans.map((plan) => (
            <div 
              key={plan._id} 
              className="p-4 border rounded-lg bg-white shadow-sm"
            >
              {editingPlan?._id === plan._id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="플랜 제목"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSaveEdit}
                    variant="outline"
                    size="sm"
                  >
                    저장
                  </Button>
                  <Button 
                    onClick={() => {
                      setEditingPlan(null);
                      setEditTitle("");
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    취소
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                         onClick={() => onSelect(plan)}>
                      {plan.title || `여행 계획 ${plan._id.slice(-4)}`}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      마지막 수정: {formatDate(plan.updatedAt)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(plan)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      수정
                    </Button>
                    <Button
                      onClick={() => handleDelete(plan._id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        ):
        
        
        (
          <div className="text-center py-8 text-gray-500">
            저장된 여행 계획이 없습니다
          </div>
        )}
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <Button 
            onClick={onClose}
            variant="outline"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Planner() {
  const { data: session } = useSession();
  const router = useRouter();
  const [days, setDays] = useState<Day[]>([]);
  const [expandedDayIndex, setExpandedDayIndex] = useState(0);
  const [deletedDays, setDeletedDays] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [focusedActivityIndex, setFocusedActivityIndex] = useState<{ dayIndex: number; activityIndex: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const savedDays = localStorage.getItem('travelPlan');
    if (savedDays) {
      setDays(JSON.parse(savedDays));
    } else {
      setDays([{
        title: "Day 1",
        activities: [
          { place: "", time: "", period: "AM", activity: "" }
        ],
      }]);
    }
  }, []);

  const addDay = () => {
    let newDayNumber: number;
    if (deletedDays.length > 0) {
      newDayNumber = Math.min(...deletedDays);
      setDeletedDays(deletedDays.filter(day => day !== newDayNumber));
    } else {
      newDayNumber = days.length + 1;
    }
    const newDay = {
      title: `Day ${newDayNumber}`,
      activities: [],
    };
    const newDays = [...days];
    newDays.splice(newDayNumber - 1, 0, newDay);
    setDays(newDays);
  };

  const removeDay = (dayIndex: number) => {
    setDays(days.filter((_, index) => index !== dayIndex));
    setDeletedDays([...deletedDays, dayIndex + 1]);
    if (expandedDayIndex === dayIndex) {
      setExpandedDayIndex(-1);
    }
  };

  const addActivity = (dayIndex) => {
    const newActivity = { place: "", time: "", period: "AM", activity: "" }
    const newDays = [...days]
    newDays[dayIndex].activities.push(newActivity)
    setDays(newDays)
  }

  const removeActivity = (dayIndex, activityIndex) => {
    const newDays = [...days]
    newDays[dayIndex].activities.splice(activityIndex, 1)
    setDays(newDays)
  }

  const updateActivity = (dayIndex, activityIndex, field, value) => {
    const newDays = [...days];
    newDays[dayIndex].activities[activityIndex][field] = value;
    setDays(newDays);
  };

  const handlePlaceChange = (place) => {
    if (focusedActivityIndex !== null) {
      const { dayIndex, activityIndex } = focusedActivityIndex;
      updateActivity(dayIndex, activityIndex, "place", place);
    }
  };

  const toggleDay = (dayIndex: number) => {
    if (expandedDayIndex === dayIndex) {
      setExpandedDayIndex(-1);
    } else {
      setExpandedDayIndex(dayIndex);
    }
  };
   // days 데이터를 정제하는 함수
   const sanitizeDays = (days) => {
    return days.map(day => ({
      title: day.title,
      activities: day.activities.map(activity => ({
        place: activity.place || '',
        time: activity.time || '',
        period: activity.period || 'AM',
        activity: activity.activity || ''
      }))
    }));
  };
  const sharePlanToDatabase = async ({ title, destination, numberOfPeople }) => {
    if (!session) {
      alert('여행 계획을 공유하려면 로그인이 필요합니다.');
      router.push('/login');
      return;
    }
  
    try {
      console.log('Sharing plan with:', { title, destination, numberOfPeople }); // 디버깅용 로그
  
      const sanitizedDays = days.map(day => ({
        title: day.title,
        activities: day.activities.map(activity => ({
          place: activity.place || '',
          time: activity.time || '',
          period: activity.period || 'AM',
          activity: activity.activity || ''
        }))
      }));
  
      const response = await fetch('/api/share-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days: sanitizedDays,
          title,
          destination,
          numberOfPeople: parseInt(numberOfPeople) || 1,
          planId: currentPlanId
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '공유 중 오류가 발생했습니다.');
      }
  
      const data = await response.json();
      setCurrentPlanId(data.planId);
      alert('여행 계획이 성공적으로 공유되었습니다!');
  
    } catch (error) {
      console.error('공유 중 오류:', error);
      alert(error instanceof Error ? error.message : '공유 중 오류가 발생했습니다.');
    }
  };
  const savePlanToDatabase = async (title: string) => {
    if (!session) {
      alert('여행 계획을 저장하려면 로그인이 필요합니다.');
      router.push('/login');
      return;
    }
  
    try {
      // 모든 필드가 포함된 완전한 데이터 구조 생성
      const sanitizedDays = days.map(day => ({
        title: day.title,
        activities: day.activities.map(activity => ({
          place: activity.place || '',
          time: activity.time || '',
          period: activity.period || 'AM',
          activity: activity.activity || ''
        }))
      }));
  
      // 현재 플랜의 상태 저장
      const response = await fetch('/api/save-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days: sanitizedDays,
          title,
          planId: currentPlanId
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '저장 중 오류가 발생했습니다.');
      }
  
      const data = await response.json();
      setCurrentPlanId(data.planId);
      
      // 성공 메시지 표시 및 플랜 목록 새로고침
      alert(data.message || '여행 계획이 성공적으로 저장되었습니다!');
      await loadPlan(); // 플랜 목록 새로고침
  
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.');
    }
  };
  
  // MapComponent에 전달할 함수 수정
  const handleSavePlan = () => {
    setIsSaveModalOpen(true);
  };
  const updatePlan = async (planId, newTitle) => {
    if (!session) {
      alert('여행 계획을 수정하려면 로그인이 필요합니다.');
      router.push('/social_login');
      return;
    }

    try {
      const sanitizedDays = sanitizeDays(days);
      const response = await fetch('/api/save-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          title: newTitle,
          days: sanitizedDays
        }),
      });

      if (response.ok) {
        // 성공적으로 업데이트된 후 플랜 목록 새로고침
        loadPlan();
        alert('여행 계획이 성공적으로 수정되었습니다!');
      } else {
        alert('수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('수정 중 오류:', error);
      alert('서버와 연결하는 중 오류가 발생했습니다.');
    }
  };
 

  const loadPlan = async () => {
    if (!session) {
      alert('여행 계획을 불러오려면 로그인이 필요합니다.');
      router.push('/login');
      return;
    }
  
    try {
      const response = await fetch('/api/load-plan', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '불러오기 중 오류가 발생했습니다.');
      }
  
      const data = await response.json();
      if (data.plans?.length > 0) {
        setSavedPlans(data.plans);
        setIsModalOpen(true);
      } else {
        alert('저장된 여행 계획이 없습니다.');
      }
    } catch (error) {
      console.error('불러오기 오류:', error);
      alert(error instanceof Error ? error.message : '불러오기 중 오류가 발생했습니다.');
    }
  };

  const handlePlanSelect = (selectedPlan) => {
    try {
      // 필요한 데이터만 추출하여 설정
      const sanitizedDays = sanitizeDays(selectedPlan.days);
      setDays(sanitizedDays);
      setIsModalOpen(false);
      alert('선택한 여행 계획을 불러왔습니다!');
    } catch (error) {
      console.error('플랜 선택 오류:', error);
      alert('여행 계획을 불러오는 중 오류가 발생했습니다.');
    }
  };
  const saveAsFile = () => {
    const dataStr = JSON.stringify(days);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'my_custom_plan.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const loadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            const loadedDays = JSON.parse(content);
            setDays(loadedDays);
            alert('여행 계획을 성공적으로 불러왔습니다!');
          } catch (error) {
            alert('파일을 읽는 중 오류가 발생했습니다.');
          }
        }
      };
      reader.readAsText(file);
    }
  };


  return (
    <div className="flex flex-col min-h-screen">
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
      <main className="flex-1">
        <div className="itinerary-container">
          <div className="itinerary-layout">
          <MapComponent
  days={days}
  onSavePlan={handleSavePlan}
  onLoadFile={() => fileInputRef.current?.click()}
  onLoadPlan={loadPlan}
  onSaveFile={saveAsFile}
  onShare={() => setIsShareModalOpen(true)}
  setPlace={handlePlaceChange}
  
/>
      <SavePlanModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={savePlanToDatabase}
      />
      <PlanSelectionModal
        isOpen={isModalOpen}
        plans={savedPlans}
        onSelect={handlePlanSelect}
        onClose={() => setIsModalOpen(false)}
        onUpdate={updatePlan}
        onRefresh={loadPlan}
      />
            <div className="itinerary-content">
              <div className="button-container">
                <Button onClick={addDay} className="add-day-button">Add Day</Button>
              </div>
              <div className="days-container">
                {days.sort((a, b) => parseInt(a.title.split(' ')[1]) - parseInt(b.title.split(' ')[1])).map((day, dayIndex) => (
                  <div key={dayIndex} className="day-container ${expandedDayIndex === dayIndex ? 'expanded' : 'collapsed'}">
                    <div className="day-header">
                      <h3 className="day-title" onClick={() => toggleDay(dayIndex)}>
                        {day.title}
                        {expandedDayIndex === dayIndex ? (
                          <ChevronUp className="chevron-icon" />
                        ) : (
                          <ChevronDown className="chevron-icon" />
                        )}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="remove-day-button"
                        onClick={() => removeDay(dayIndex)}
                      >
                        <Trash2 className="trash-icon" />
                      </Button>
                    </div>
                    {expandedDayIndex === dayIndex && (
                      <div className="activities-container">
                        {day.activities.map((activity, activityIndex) => (
                          <div key={activityIndex} className="activity-item">
                            <Input
                              value={activity.place}
                              onChange={(e) => updateActivity(dayIndex, activityIndex, "place", e.target.value)}
                              onFocus={() => setFocusedActivityIndex({ dayIndex, activityIndex })}
                              placeholder="장소"
                            />
                            <div className="time-input-container">
                              <Input
                                className="time-input"
                                placeholder="시간 : ex(10:00)"
                                value={activity.time}
                                onChange={(e) => updateActivity(dayIndex, activityIndex, "time", e.target.value)}
                              />
                              <select
                                className="period-select"
                                value={activity.period}
                                onChange={(e) => updateActivity(dayIndex, activityIndex, "period", e.target.value)}
                              >
                                <option value="AM">오전</option>
                                <option value="PM">오후</option>
                              </select>
                            </div>
                            <Input
                              placeholder="할 일"
                              value={activity.activity}
                              onChange={(e) => updateActivity(dayIndex, activityIndex, "activity", e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="remove-activity-button"
                              onClick={() => removeActivity(dayIndex, activityIndex)}
                            >
                              <Trash2 className="trash-icon" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" onClick={() => addActivity(dayIndex)} className="add-activity-button">
                          Add Activity
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <input
        type="file"
        ref={fileInputRef}
        onChange={loadFile}
        style={{ display: 'none' }}
        accept=".json"
      />
       <PlanSelectionModal
  isOpen={isModalOpen}
  plans={savedPlans}
  onSelect={handlePlanSelect}
  onClose={() => setIsModalOpen(false)}
  onUpdate={updatePlan}
  onRefresh={loadPlan}  // loadPlan 함수 전달
/>
<SharePlanModal
  isOpen={isShareModalOpen}
  onClose={() => setIsShareModalOpen(false)}
  onShare={sharePlanToDatabase}
/>
    </div>
  )
}