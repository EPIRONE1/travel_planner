"use client"

import MapComponent from "./ui/MapComponent"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ChevronUp, ChevronDown, Trash2, Save, Upload } from 'lucide-react'
import './styles/itinerary-planner.css';

// // 새로운 타입 정의
// interface MapProps {
//   days: Array<{ title: string; activities: Array<{ place: string; time: string; period: string; activity: string }> }>;
// }

// // Google Maps 컴포넌트
// function Map({ days }: MapProps) {
//   const [map, setMap] = useState(null);
//   const [searchInput, setSearchInput] = useState('');

//   useEffect(() => {
//     // Google Maps API 스크립트 로드
//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBosOmwvXAAl2z6xYy-L6D2I0agK3XpvXs&callback=initMap`;
//     script.async = true;
//     document.body.appendChild(script);

//     window.initMap = () => {
//       const newMap = new window.google.maps.Map(document.getElementById("map"), {
//         center: { lat: 48.8566, lng: 2.3522 }, // Paris coordinates
//         zoom: 13,
//       });
//       setMap(newMap);
//     };

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   useEffect(() => {
//     if (map) {
//       // 각 장소에 마커 추가
//       days.forEach(day => {
//         day.activities.forEach(activity => {
//           const geocoder = new window.google.maps.Geocoder();
//           geocoder.geocode({ address: activity.place }, (results, status) => {
//             if (status === 'OK') {
//               new window.google.maps.Marker({
//                 map: map,
//                 position: results[0].geometry.location,
//                 title: activity.place
//               });
//             }
//           });
//         });
//       });
//     }
//   }, [map, days]);

//   const searchCountry = () => {
//     if (map) {
//       const geocoder = new window.google.maps.Geocoder();
//       geocoder.geocode({ address: searchInput }, (results, status) => {
//         if (status === 'OK') {
//           map.setCenter(results[0].geometry.location);
//           map.setZoom(5);
//         } else {
//           alert('검색에 실패했습니다: ' + status);
//         }
//       });
//     }
//   };

//   return (
//     <div className="map-wrapper">
//       <div id="map" className="map-container"></div>
//       <div className="search-container">
//         <Input
//           placeholder="주소 검색"
//           value={searchInput}
//           onChange={(e) => setSearchInput(e.target.value)}
//         />
//         <Button onClick={searchCountry}>검색</Button>
//       </div>
//     </div>
//   );
// }

export default function Planner() {
  const [days, setDays] = useState<Array<{ title: string; activities: Array<{ place: string; time: string; period: string; activity: string }> }>>([]);
  const [expandedDayIndex, setExpandedDayIndex] = useState(0);
  const [deletedDays, setDeletedDays] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [focusedActivityIndex, setFocusedActivityIndex] = useState(null); // 현재 포커스된 입력란 추적

  
  useEffect(() => {
    // 페이지 로드 시 로컬 스토리지에서 데이터 불러오기
    const savedDays = localStorage.getItem('travelPlan');
    if (savedDays) {
      setDays(JSON.parse(savedDays));
    } else {
      // 저장된 데이터가 없으면 기본 데이터 설정
      setDays([
        {
          title: "Day 1",
          activities: [
            { place: "Eiffel Tower", time: "10:00", period: "AM", activity: "Visit" },
            { place: "Louvre Museum", time: "2:00", period: "PM", activity: "Tour" },
          ],
        },
      ]);
    }
  }, []);

  const addDay = () => {
    let newDayNumber: number; // 타입을 명시적으로 지정
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
      // 현재 포커스된 활동의 장소에 클릭된 주소를 입력
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

  // const savePlan = () => {
  //   const dataStr = JSON.stringify(days);
  //   const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  //   const exportFileDefaultName = 'travel_plan.json';

  //   const linkElement = document.createElement('a');
  //   linkElement.setAttribute('href', dataUri);
  //   linkElement.setAttribute('download', exportFileDefaultName);
  //   linkElement.click();
  // };
  // API 호출 함수
  const savePlanToDatabase = async () => {
    try {
      const response = await fetch('/api/save-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days }), // 여행 계획 데이터를 API로 전송
      });
  
      if (response.ok) {
        alert('여행 계획이 성공적으로 저장되었습니다!');
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert('서버와 연결하는 중 오류가 발생했습니다.');
    }
  };
  
  const saveAsFile = () => {
    const dataStr = JSON.stringify(days);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'my_custom_plan.json'; // You can customize the filename here

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const loadPlan = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      <main className="flex-1">
        <div className="itinerary-container">
          <div className="itinerary-layout">
          <MapComponent
            days={days}
            onSavePlan={savePlanToDatabase}
            onLoadPlan={() => fileInputRef.current?.click()}
            onSaveFile={saveAsFile}
            setPlace={handlePlaceChange} // Click된 주소를 전달할 함수
          />  
            <div className="itinerary-content">
              <div className="button-container">
                <Button onClick={addDay} className="add-day-button">Add Day</Button>
               
              </div>
              <div className="days-container">
                {days.sort((a, b) => parseInt(a.title.split(' ')[1]) - parseInt(b.title.split(' ')[1])).map((day, dayIndex) => (
                  <div key={dayIndex} className={`day-container ${expandedDayIndex === dayIndex ? 'expanded' : 'collapsed'}`}>
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
                  key={activityIndex}
                  value={activity.place}
                  onChange={(e) => updateActivity(dayIndex, activityIndex, "place", e.target.value)}
                  onFocus={() => setFocusedActivityIndex({ dayIndex, activityIndex })} // 포커스된 입력란 추적
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
      onChange={loadPlan}
      style={{ display: 'none' }}
      accept=".json"
    />
    </div>
  )
}
