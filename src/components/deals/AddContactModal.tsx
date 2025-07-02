import React, { useState } from 'react';
import { useContactStore } from '../../store/contactStore';
import { Contact } from '../../types/contact';
import { X, Save, User, Building2, Mail, Phone, Tag, Globe, Briefcase } from 'lucide-react';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (contact: Contact) => void;
  selectAfterCreate?: boolean;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectAfterCreate = false
}) => {
  const { createContact } = useContactStore();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    company: '',
    industry: '',
    status: 'lead' as Contact['status'],
    interestLevel: 'medium' as Contact['interestLevel'],
    source: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.company.trim()) errors.company = 'Company is required';
    
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      const newContact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        title: formData.title,
        company: formData.company,
        industry: formData.industry,
        status: formData.status,
        interestLevel: formData.interestLevel,
        sources: formData.source ? [formData.source] : [],
        notes: formData.notes,
        socialProfiles: {},
        customFields: {},
      };
      
      const createdContact = await createContact(newContact);
      
      if (onSave) {
        onSave(createdContact);
      }
      
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create contact:', error);
      setFormErrors({
        form: 'Failed to create contact. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      title: '',
      company: '',
      industry: '',
      status: 'lead',
      interestLevel: 'medium',
      source: '',
      notes: ''
    });
    setFormErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[75] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Create New Contact
          </h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 max-h-[calc(90vh-130px)]">
          {formErrors.form && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {formErrors.form}
            </div>
          )}
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Contact Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={`w-full px-3 py-2 border ${formErrors.firstName ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    placeholder="John"
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={`w-full px-3 py-2 border ${formErrors.lastName ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    placeholder="Doe"
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border ${formErrors.email ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="+1 (123) 456-7890"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                Company Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border ${formErrors.company ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      placeholder="Acme Inc."
                    />
                  </div>
                  {formErrors.company && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.company}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Marketing Manager"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Technology"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="LinkedIn, Website, Referral, etc."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-3">
                Status Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Contact['status'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="customer">Customer</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Level
                  </label>
                  <select
                    value={formData.interestLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, interestLevel: e.target.value as Contact['interestLevel'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="hot">Hot</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="cold">Cold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Add any relevant notes about this contact..."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Create Contact</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;