import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"
import { Avatar, AvatarFallback } from "./ui/avatar"

const TravelPlanDetail = ({ plan }) => {
  if (!plan) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{plan.creator?.[0]}</AvatarFallback>
                </Avatar>
                <span>{plan.creator}</span>
              </div>
            </div>
            <button 
              onClick={plan.onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(90vh-12rem)]">
            {plan.days?.map((day, dayIndex) => (
              <Card key={dayIndex} className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">Day {dayIndex + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  {day.activities?.map((activity, actIndex) => (
                    <div 
                      key={actIndex}
                      className="mb-4 p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{activity.place}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4" />
                        <span>{activity.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{activity.period}</span>
                      </div>
                      {activity.activity && (
                        <p className="mt-2 text-gray-600">{activity.activity}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPlanDetail;