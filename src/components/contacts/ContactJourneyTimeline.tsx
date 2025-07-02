import React from 'react';
import { Contact } from '../../types/contact';
import { ArrowRight, Calendar, CheckCircle, Clock, PhoneCall, Mail, MessageSquare, Target, AlertCircle } from 'lucide-react';

interface ContactJourneyTimelineProps {
  contact: Contact;
}

export const ContactJourneyTimeline: React.FC<ContactJourneyTimelineProps> = ({ contact }) => {
  // Generate some sample timeline events based on contact data
  const generateTimelineEvents = () => {
    const today = new Date();
    
    const events = [
      {
        id: 1,
        type: 'added',
        title: 'Contact Added',
        description: `${contact.firstName} was added to the CRM`,
        date: contact.createdAt,
        icon: CheckCircle,
        iconColor: 'bg-green-500',
        complete: true
      }
    ];

    // Add source-based event
    if (contact.sources.includes('LinkedIn')) {
      const linkedInDate = new Date(contact.createdAt);
      events.push({
        id: 2,
        type: 'source',
        title: 'LinkedIn Connection',
        description: 'Connected via LinkedIn',
        date: linkedInDate,
        icon: ArrowRight,
        iconColor: 'bg-blue-600',
        complete: true
      });
    }
    
    // Add status change event
    if (contact.status === 'prospect' || contact.status === 'customer') {
      const statusChangeDate = new Date(today.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000));
      events.push({
        id: 3,
        type: 'status',
        title: `Became ${contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}`,
        description: `Status changed to ${contact.status}`,
        date: statusChangeDate,
        icon: Target,
        iconColor: 'bg-purple-500',
        complete: true
      });
    }
    
    // Add communication event
    if (contact.lastConnected) {
      const communicationDate = new Date(today.getTime() - (Math.random() * 7 * 24 * 60 * 60 * 1000));
      events.push({
        id: 4,
        type: 'communication',
        title: 'Last Communication',
        description: `${Math.random() > 0.5 ? 'Email sent' : 'Phone call'}`,
        date: communicationDate,
        icon: Math.random() > 0.5 ? Mail : PhoneCall,
        iconColor: Math.random() > 0.5 ? 'bg-blue-500' : 'bg-green-500',
        complete: true
      });
    }
    
    // Add upcoming event
    const futureDate = new Date(today.getTime() + (Math.random() * 10 * 24 * 60 * 60 * 1000));
    events.push({
      id: 5,
      type: 'upcoming',
      title: 'Follow-up Scheduled',
      description: 'Scheduled follow-up meeting',
      date: futureDate,
      icon: Calendar,
      iconColor: 'bg-yellow-500',
      complete: false
    });

    // Sort events by date
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const timelineEvents = generateTimelineEvents();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Contact Journey</h3>
        <button className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center">
          <Target className="w-4 h-4 mr-1" /> Set Goals
        </button>
      </div>
      
      {/* Timeline Visualization */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 z-0"></div>
        
        <div className="space-y-8">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative z-10 flex items-start">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full ${event.iconColor} flex items-center justify-center shadow-md mr-4`}>
                <event.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium text-gray-900">{event.title}</h4>
                  <span className={`text-sm ${event.complete ? 'text-gray-500' : 'text-blue-600 font-medium'}`}>
                    {event.complete ? formatDate(event.date) : 'Upcoming'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                
                {/* Additional actions based on event type */}
                {event.type === 'upcoming' && (
                  <div className="mt-3 flex space-x-3">
                    <button className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                      Reschedule
                    </button>
                    <button className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
                
                {event.type === 'communication' && (
                  <div className="mt-2 text-sm text-gray-500">
                    <p className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Add new journey point */}
          <div className="relative z-10 flex items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 border-dashed flex items-center justify-center mr-4">
              <Plus className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 border-dashed p-4">
              <button className="w-full text-left">
                <h4 className="text-base font-medium text-blue-700">Add Journey Point</h4>
                <p className="text-sm text-blue-600 mt-1">Record a new milestone or interaction</p>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Journey Metrics Summary */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h5 className="text-sm font-medium text-gray-600 mb-1">First Contact</h5>
          <p className="text-lg font-semibold text-gray-900">{formatDate(contact.createdAt)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h5 className="text-sm font-medium text-gray-600 mb-1">Days Active</h5>
          <p className="text-lg font-semibold text-gray-900">
            {Math.ceil((new Date().getTime() - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h5 className="text-sm font-medium text-gray-600 mb-1">Touchpoints</h5>
          <p className="text-lg font-semibold text-gray-900">{Math.floor(Math.random() * 10) + 2}</p>
        </div>
      </div>
    </div>
  );
};