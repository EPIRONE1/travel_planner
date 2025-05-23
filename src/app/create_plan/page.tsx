"use client"

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

import MapComponent from "./ui/MapComponent"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import  Header  from "@/components/ui/Header";
import { ChevronUp, ChevronDown, Trash2, Save, Upload } from 'lucide-react'
import './styles/itinerary-planner.css'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"


const SharePlanModal = ({ 
  isOpen,
  onClose,
  onShare 
}: {
  isOpen: boolean;
  onClose: () => void;
  onShare: (data: { title: string; numberOfPeople: number; destination: string }) => void;
}) => {
  const [title, setTitle] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("1"); // string type으로 변경
  const [destination, setDestination] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 숫자 타입으로 변환하여 전달
    onShare({
      title,
      numberOfPeople: parseInt(numberOfPeople, 10),
      destination
    });
    
    // 폼 초기화
    setTitle("");
    setNumberOfPeople("1");
    setDestination("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">여행 계획 공유하기</h2>
          <p className="text-sm text-gray-500 mt-1">여행 계획의 정보를 입력해주세요</p>
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
              여행지
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
                onChange={(e) => setNumberOfPeople(e.target.value)}
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

const SavePlanModal = ({ 
  isOpen,
  onClose,
  onSave 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
}) => {
  const [title, setTitle] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [destination, setDestination] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // title만 전달하도록 수정
    onSave(title);
    
    setTitle("");
    setNumberOfPeople(1);
    setDestination("");
    onClose();
  };

  // isOpen이 false면 null 반환하여 모달을 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">여행 계획 저장</h2>
          <p className="text-sm text-gray-500 mt-1">여행 계획의 정보를 입력해주세요</p>
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
              여행지
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
interface Plan {
  _id: string;
  title: string;
  days: Day[];
  updatedAt: string | Date;
}

interface PlanSelectionModalProps {
  isOpen: boolean;
  plans: Plan[];
  onSelect: (plan: Plan) => void;
  onClose: () => void;
  onUpdate: (id: string, title: string) => Promise<void>;
  onRefresh: () => void;
}

const PlanSelectionModal = ({ isOpen, plans, onSelect, onClose, onUpdate, onRefresh }: PlanSelectionModalProps) => {
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");

  const handleDelete = async (planId: string) => {
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
  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setEditTitle(plan.title || "");
  };
  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    
    await onUpdate(editingPlan._id, editTitle);
    setEditingPlan(null);
    setEditTitle("");
  };

  const formatDate = (dateString: string) => {
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
                      마지막 수정: {formatDate(plan.updatedAt instanceof Date ? plan.updatedAt.toISOString() : plan.updatedAt)}
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
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedDays = localStorage.getItem('travelPlan');
    if (savedDays) {
      setDays(JSON.parse(savedDays));
    } else {
      setDays([{
        title: "1 일차",
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
      title: `${newDayNumber} 일차`,
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

  const addActivity = (dayIndex: number): void => {
    const newActivity: Activity = { place: "", time: "", period: "AM", activity: "" }
    const newDays: Day[] = [...days]
    newDays[dayIndex].activities.push(newActivity)
    setDays(newDays)
  }

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const newDays = [...days]
    newDays[dayIndex].activities.splice(activityIndex, 1)
    setDays(newDays)
  }

  const updateActivity = (dayIndex: number, activityIndex: number, field: keyof Activity, value: string) => {
    const newDays = [...days];
    newDays[dayIndex].activities[activityIndex][field] = value;
    setDays(newDays);
  };

  const handlePlaceChange = (place: string) => {
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
   const sanitizeDays = (days: Day[]) => {
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
  const sharePlanToDatabase = async ({ title, numberOfPeople, destination }: { title: string; numberOfPeople: number; destination: string }) => {
    if (!session) {
      alert('여행 계획을 공유하려면 로그인이 필요합니다.');
      router.push('/social_login');
      return;
    }
  
    try {
      console.log('Sending data:', { title, numberOfPeople, destination }); // 디버깅용 로그
  
      const response = await fetch('/api/share-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days,
          title,
          numberOfPeople: Number(numberOfPeople), // 명시적으로 Number로 변환
          destination,
          planId: currentPlanId
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '공유 중 오류가 발생했습니다.');
      }
  
      const data = await response.json();
      console.log('Response data:', data); // 디버깅용 로그
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
      router.push('social_login');
      return;
    }
  
    try {
      const sanitizedDays = days.map(day => ({
        title: day.title,
        activities: day.activities.map(activity => ({
          place: activity.place || '',
          time: activity.time || '',
          period: activity.period || 'AM',
          activity: activity.activity || ''
        }))
      }));
  
      // 기본값을 포함한 요청 데이터 생성
      const planData = {
        days: sanitizedDays,
        title: title,
        numberOfPeople: 1,  // 기본값 설정
        destination: '',    // 기본값 설정
        planId: currentPlanId || undefined  // planId가 null이면 undefined로 설정
      };
  
      const response = await fetch('/api/save-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '저장 중 오류가 발생했습니다.');
      }
  
      const data = await response.json();
      setCurrentPlanId(data.planId);
      
      alert(data.message || '여행 계획이 성공적으로 저장되었습니다!');
      await loadPlan();
  
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.');
    }
  };
  // MapComponent에 전달할 함수 수정
  const handleSavePlan = () => {
    setIsSaveModalOpen(true);
  };
  const updatePlan = async (planId: string, newTitle: string) => {
    if (!session) {
      alert('여행 계획을 수정하려면 로그인이 필요합니다.');
      router.push('/social_login');
      return;
    }
  
    try {
      const sanitizedDays = sanitizeDays(days);
      const updateData = {
        planId,
        title: newTitle,
        days: sanitizedDays,
        numberOfPeople: 1,  // 기본값 설정
        destination: ''     // 기본값 설정
      };
  
      const response = await fetch('/api/save-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
  
      if (response.ok) {
        loadPlan();
        alert('여행 계획이 성공적으로 수정되었습니다!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('수정 중 오류:', error);
      alert(error instanceof Error ? error.message : '서버와 연결하는 중 오류가 발생했습니다.');
    }
  };
  

  const loadPlan = async () => {
    if (!session) {
      alert('여행 계획을 불러오려면 로그인이 필요합니다.');
      router.push('/social_login');
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

  const handlePlanSelect = (selectedPlan: Plan) => {
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
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Compact Header */}
      <Header />

      {/* Main Content - Fills remaining height */}
      <main className="flex-1 container mx-auto px-2 pb-2 overflow-hidden">
        <div className="h-full bg-white shadow-sm">
          <div className="grid lg:grid-cols-2 h-full">
            {/* Map Section - 고정 높이 */}
            <div className="h-full overflow-hidden">
              <MapComponent
                days={days}
                onSavePlan={handleSavePlan}
                onLoadFile={() => fileInputRef.current?.click()}
                onLoadPlan={loadPlan}
                onSaveFile={saveAsFile}
                onShare={() => setIsShareModalOpen(true)}
                setPlace={handlePlaceChange}
              />
            </div>

            {/* Itinerary Section - 고정 높이와 스크롤 */}
            <div className="border-l border-gray-200 flex flex-col h-full overflow-hidden">
              {/* 헤더 영역 - 고정 */}
              <div className="flex-none px-4 py-3 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">여행 일정</h2>
                  <Button 
                    onClick={addDay}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    size="sm"
                  >
                    일정 추가
                  </Button>
                </div>
              </div>

              {/* 스크롤 가능한 일정 목록 영역 */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-3">
                  {days
                    .sort((a, b) => parseInt(a.title.split(' ')[1]) - parseInt(b.title.split(' ')[1]))
                    .map((day, dayIndex) => (
                    <div 
                      key={dayIndex} 
                      className="border rounded-lg bg-white shadow-sm"
                    >
                      <div 
                        className="flex justify-between items-center px-3 py-2 cursor-pointer bg-gradient-to-r from-blue-50 to-white"
                        onClick={() => toggleDay(dayIndex)}
                      >
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                          <span className="text-blue-600">{day.title}</span>
                          {expandedDayIndex === dayIndex ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDay(dayIndex);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {expandedDayIndex === dayIndex && (
                        <div className="p-3 space-y-2">
                          {day.activities.map((activity, activityIndex) => (
                            <div 
                              key={activityIndex} 
                              className="bg-gray-50 rounded p-3 space-y-2 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <Input
                                  value={activity.place}
                                  onChange={(e) => updateActivity(dayIndex, activityIndex, "place", e.target.value)}
                                  onFocus={() => setFocusedActivityIndex({ dayIndex, activityIndex })}
                                  placeholder="장소"
                                  className="flex-1 border-gray-300 focus:border-blue-500 bg-white"
                                />
                              </div>
                              
                              <div className="flex gap-2 pl-4">
                                <Input
                                  className="flex-1 bg-white"
                                  placeholder="시간 (예: 10:00)"
                                  value={activity.time}
                                  onChange={(e) => updateActivity(dayIndex, activityIndex, "time", e.target.value)}
                                />
                                <select
                                  className="px-2 py-1 border rounded text-gray-700 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  value={activity.period}
                                  onChange={(e) => updateActivity(dayIndex, activityIndex, "period", e.target.value)}
                                >
                                  <option value="AM">오전</option>
                                  <option value="PM">오후</option>
                                </select>
                              </div>

                              <div className="flex gap-2 pl-4">
                                <Input
                                  placeholder="활동 내용"
                                  value={activity.activity}
                                  onChange={(e) => updateActivity(dayIndex, activityIndex, "activity", e.target.value)}
                                  className="flex-1 bg-white"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeActivity(dayIndex, activityIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button 
                            variant="outline" 
                            onClick={() => addActivity(dayIndex)}
                            className="w-full mt-2 text-blue-600 hover:text-blue-700 border-dashed text-sm"
                            size="sm"
                          >
                            + 새로운 일정 추가
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
      <SharePlanModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={sharePlanToDatabase}
      />
    </div>
  )
}