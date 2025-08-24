"use client";

import React, { useState } from "react";

/**
 * Calendar page component - Schedule and event management
 */
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");

  // Mock calendar data
  const calendarStats = [
    {
      id: 1,
      title: "Today's Events",
      value: "6",
      change: "2 upcoming",
      changeType: "neutral",
      icon: "📅"
    },
    {
      id: 2,
      title: "This Week",
      value: "23",
      change: "+5 from last week",
      changeType: "positive",
      icon: "📊"
    },
    {
      id: 3,
      title: "Meetings",
      value: "12",
      change: "4 today",
      changeType: "neutral",
      icon: "🤝"
    },
    {
      id: 4,
      title: "Free Time",
      value: "65%",
      change: "Optimal schedule",
      changeType: "positive",
      icon: "⏰"
    },
  ];

  const todaysEvents = [
    {
      id: 1,
      title: "Team Standup",
      time: "9:00 AM - 9:30 AM",
      type: "meeting",
      attendees: ["Sarah Johnson", "Mike Chen", "David Kim"],
      location: "Conference Room A",
      status: "confirmed"
    },
    {
      id: 2,
      title: "Product Review",
      time: "11:00 AM - 12:00 PM",
      type: "review",
      attendees: ["Emily Rodriguez", "Lisa Wang"],
      location: "Virtual",
      status: "confirmed"
    },
    {
      id: 3,
      title: "Client Presentation",
      time: "2:00 PM - 3:30 PM",
      type: "presentation",
      attendees: ["James Wilson", "Alex Thompson"],
      location: "Client Office",
      status: "pending"
    },
    {
      id: 4,
      title: "Code Review Session",
      time: "4:00 PM - 5:00 PM",
      type: "review",
      attendees: ["Mike Chen", "Sarah Johnson"],
      location: "Dev Room",
      status: "confirmed"
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Quarterly Planning",
      date: "Tomorrow",
      time: "10:00 AM - 12:00 PM",
      type: "planning",
      priority: "high"
    },
    {
      id: 2,
      title: "Design Workshop",
      date: "March 25",
      time: "2:00 PM - 4:00 PM",
      type: "workshop",
      priority: "medium"
    },
    {
      id: 3,
      title: "All Hands Meeting",
      date: "March 28",
      time: "3:00 PM - 4:00 PM",
      type: "meeting",
      priority: "high"
    },
    {
      id: 4,
      title: "Training Session",
      date: "March 30",
      time: "1:00 PM - 3:00 PM",
      type: "training",
      priority: "low"
    },
  ];

  const calendarViews = [
    { id: "day", name: "Day" },
    { id: "week", name: "Week" },
    { id: "month", name: "Month" },
    { id: "agenda", name: "Agenda" },
  ];

  const eventTypes = [
    { type: "meeting", color: "bg-blue-500", count: 8 },
    { type: "review", color: "bg-green-500", count: 4 },
    { type: "presentation", color: "bg-purple-500", count: 3 },
    { type: "planning", color: "bg-orange-500", count: 2 },
    { type: "workshop", color: "bg-red-500", count: 3 },
    { type: "training", color: "bg-indigo-500", count: 3 },
  ];

  const getEventTypeColor = (type: string) => {
    const eventType = eventTypes.find(et => et.type === type);
    return eventType ? eventType.color : 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
              <p className="text-sm md:text-base text-gray-600">Manage your schedule, meetings, and events</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {calendarViews.map((viewOption) => (
                  <button
                    key={viewOption.id}
                    onClick={() => setView(viewOption.id)}
                    className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm font-medium transition-colors ${
                      view === viewOption.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {viewOption.name}
                  </button>
                ))}
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base">
                New Event
              </button>
            </div>
          </div>

          {/* Calendar Stats */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Schedule Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {calendarStats.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{stat.icon}</div>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        stat.changeType === 'positive'
                          ? 'bg-green-100 text-green-800'
                          : stat.changeType === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Schedule */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Schedule</h3>
                <div className="space-y-4">
                  {todaysEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg">
                      <div className={`w-4 h-4 ${getEventTypeColor(event.type)} rounded-full mt-1 flex-shrink-0`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{event.time}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📍 {event.location}</span>
                          <span>👥 {event.attendees.length} attendees</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm">Join</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini Calendar View */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">March 2024</h3>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Calendar Header */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 6; // Adjust for month start
                    const isCurrentMonth = day > 0 && day <= 31;
                    const isToday = day === 22; // Mock today as 22nd
                    const hasEvents = [15, 18, 22, 25, 28].includes(day);
                    
                    return (
                      <div
                        key={i}
                        className={`p-2 text-sm cursor-pointer rounded ${
                          isCurrentMonth
                            ? isToday
                              ? 'bg-blue-600 text-white'
                              : hasEvents
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'text-gray-900 hover:bg-gray-100'
                            : 'text-gray-300'
                        }`}
                      >
                        {isCurrentMonth ? day : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{event.date} • {event.time}</p>
                      <span className={`inline-block w-2 h-2 ${getEventTypeColor(event.type)} rounded-full mr-2`}></span>
                      <span className="text-xs text-gray-500 capitalize">{event.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Types Legend */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types</h3>
                <div className="space-y-3">
                  {eventTypes.map((eventType) => (
                    <div key={eventType.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 ${eventType.color} rounded-full`}></div>
                        <span className="text-sm text-gray-900 capitalize">{eventType.type}</span>
                      </div>
                      <span className="text-sm text-gray-500">{eventType.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📅</span>
                      <span className="text-sm font-medium text-gray-900">Schedule Meeting</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🔄</span>
                      <span className="text-sm font-medium text-gray-900">Sync Calendar</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📊</span>
                      <span className="text-sm font-medium text-gray-900">View Analytics</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
