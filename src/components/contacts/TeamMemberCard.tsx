import React from 'react';
import { Contact } from '../../types/contact';
import {
  User,
  Star,
  Award,
  Trophy,
  Zap,
  BarChart3,
  TrendingUp,
  UserMinus,
  Edit,
  Mail,
  Phone,
  Crown
} from 'lucide-react';

interface TeamMemberCardProps {
  member: Contact;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onRemove: () => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  isSelected,
  onSelect,
  onClick,
  onRemove
}) => {
  const { gamificationStats } = member;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    onClick();
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group relative border border-gray-200 hover:border-indigo-300 overflow-hidden"
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 bg-white border-gray-300"
        />
      </div>

      {/* Header Actions */}
      <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          title="Remove from team"
        >
          <UserMinus className="w-4 h-4" />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Handle edit action
          }}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6">
        {/* Avatar and Member Info */}
        <div className="text-center mb-6 mt-4">
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-100 bg-indigo-50 flex items-center justify-center">
              {member.avatarSrc ? (
                <img 
                  src={member.avatarSrc}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-indigo-500" />
              )}
            </div>
            
            {/* Role Badge */}
            <div className="absolute -bottom-2 -right-1 bg-indigo-600 text-white px-2 py-0.5 rounded-full text-xs shadow-lg">
              {member.role === 'manager' ? 'Manager' : 
               member.role === 'executive' ? 'Executive' : 
               member.role === 'admin' ? 'Admin' : 'Sales Rep'}
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
          <p className="text-sm text-gray-600">{member.title}</p>
          <p className="text-xs text-gray-500">{member.company}</p>

          {/* Member Level Badge */}
          <div className="mt-2 inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 rounded-full">
            <Crown className="w-3 h-3 text-yellow-300 mr-1" />
            <span className="text-xs font-bold text-white">Level {gamificationStats?.level || 1}</span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-indigo-50 rounded-lg p-3 mb-4">
          <h4 className="text-xs font-semibold text-indigo-900 uppercase tracking-wide mb-2 flex items-center justify-center">
            <Trophy className="w-3 h-3 text-indigo-600 mr-1" />
            Performance Stats
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-2 rounded border border-indigo-100">
              <p className="text-xs text-indigo-500 mb-1">Win Rate</p>
              <p className="text-base font-bold text-indigo-900">{gamificationStats?.winRate || 0}%</p>
            </div>
            <div className="bg-white p-2 rounded border border-indigo-100">
              <p className="text-xs text-indigo-500 mb-1">Deals Closed</p>
              <p className="text-base font-bold text-indigo-900">{gamificationStats?.totalDeals || 0}</p>
            </div>
            <div className="bg-white p-2 rounded border border-indigo-100">
              <p className="text-xs text-indigo-500 mb-1">Revenue</p>
              <p className="text-base font-bold text-indigo-900">${(gamificationStats?.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white p-2 rounded border border-indigo-100">
              <p className="text-xs text-indigo-500 mb-1">Streak</p>
              <p className="text-base font-bold text-indigo-900">{gamificationStats?.currentStreak || 0}</p>
            </div>
          </div>
        </div>

        {/* Progress Towards Goal */}
        {gamificationStats?.monthlyGoal && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-gray-700">Monthly Goal</span>
              <span className="font-medium text-indigo-700">${(gamificationStats.monthlyProgress || 0).toLocaleString()} / ${gamificationStats.monthlyGoal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                style={{ width: `${Math.min(100, ((gamificationStats.monthlyProgress || 0) / gamificationStats.monthlyGoal) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {gamificationStats?.achievements && gamificationStats.achievements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center justify-center">
              <Award className="w-3 h-3 text-yellow-600 mr-1" />
              Achievements
            </h4>
            <div className="flex flex-wrap justify-center gap-1">
              {gamificationStats.achievements.slice(0, 3).map((achievement, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                >
                  <Star className="w-3 h-3 mr-1 text-yellow-600" />
                  {achievement === 'first-deal' ? 'First Deal' : 
                   achievement === 'deal-streak-5' ? '5 Deal Streak' :
                   achievement === 'revenue-milestone-100k' ? '$100K Revenue' :
                   achievement === 'pipeline-master' ? 'Pipeline Master' :
                   achievement}
                </span>
              ))}
              {gamificationStats.achievements.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  +{gamificationStats.achievements.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contact Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `mailto:${member.email}`;
            }}
            className="flex items-center justify-center py-2 px-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-xs font-medium"
          >
            <Mail className="w-3 h-3 mr-1" />
            Email
          </button>
          {member.phone ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${member.phone}`;
              }}
              className="flex items-center justify-center py-2 px-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
            >
              <Phone className="w-3 h-3 mr-1" />
              Call
            </button>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex items-center justify-center py-2 px-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs font-medium"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Stats
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;