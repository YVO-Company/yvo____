import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

export default function EmployeeCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null); // For modal
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/employee/dashboard/calendar');
            setEvents(res.data);
        } catch (error) {
            console.error("Error fetching calendar", error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar Helpers
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const renderCalendarGrid = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50 border border-slate-100"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const dayEvents = events.filter(e => new Date(e.start).toDateString() === dateStr);
            const isToday = new Date().toDateString() === dateStr;

            days.push(
                <div key={day} className={`h-32 border border-slate-100 p-2 overflow-y-auto hover:bg-slate-50 transition-colors ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                            {day}
                        </span>
                    </div>
                    <div className="space-y-1">
                        {dayEvents.map(event => (
                            <div
                                key={event._id}
                                onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                                className={`text-xs p-1.5 rounded border border-l-2 mb-1 cursor-pointer truncate hover:opacity-80 transition-opacity
                                    ${event.type === 'Meeting' ? 'bg-purple-50 border-purple-200 border-l-purple-500 text-purple-700' :
                                        event.type === 'Holiday' ? 'bg-green-50 border-green-200 border-l-green-500 text-green-700' :
                                            'bg-blue-50 border-blue-200 border-l-blue-500 text-blue-700'}`}
                                title="Click to view details"
                            >
                                <div className="font-semibold truncate">{event.title}</div>
                                {event.start && (
                                    <div className="text-[10px] opacity-80">
                                        {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if (loading) return <div className="p-8 text-center text-slate-500">Loading calendar...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" />
                        Calendar & Reminders
                    </h1>
                    <p className="text-slate-500 text-sm">Schedule meetings, tasks, and deadlines.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    {/* View Controls (Mobile Scroll) */}
                    <div className="flex items-center gap-2 md:hidden w-full justify-between sm:w-auto sm:justify-start">
                        <span className="text-xs font-semibold text-slate-500">View:</span>
                        <div className="flex bg-white rounded-lg border border-slate-200 shadow-sm">
                            <button onClick={scrollLeft} className="p-2 hover:bg-slate-50 text-slate-600 border-r border-slate-200 rounded-l-lg">
                                <ArrowLeft size={18} />
                            </button>
                            <button onClick={scrollRight} className="p-2 hover:bg-slate-50 text-slate-600 rounded-r-lg">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm w-full md:w-auto justify-between md:justify-start">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-50 text-slate-600 rounded-l-lg border-r border-slate-200">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="px-4 py-2 font-semibold text-slate-700 min-w-[140px] text-center flex-1 md:flex-none">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-50 text-slate-600 rounded-r-lg border-l border-slate-200">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden" ref={scrollRef}>
                    <div className="min-w-[800px]">
                        {/* Days Header */}
                        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-7 bg-slate-200 gap-px border-l border-t border-slate-200">
                            {renderCalendarGrid()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <CalendarIcon size={18} className="text-blue-600" />
                                Event Details
                            </h3>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-1">{selectedEvent.title}</h2>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full 
                                    ${selectedEvent.type === 'Meeting' ? 'bg-purple-100 text-purple-700' :
                                        selectedEvent.type === 'Holiday' ? 'bg-green-100 text-green-700' :
                                            'bg-blue-100 text-blue-700'}`}>
                                    {selectedEvent.type}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <Clock size={18} className="text-slate-400 shrink-0" />
                                <div>
                                    <div className="font-medium text-slate-900">
                                        {new Date(selectedEvent.start).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="text-slate-500">
                                        {new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Description</h4>
                                <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                                    {selectedEvent.description || "No description provided."}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
