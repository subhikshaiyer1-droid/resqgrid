import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceCreationFormData, resourceCreationSchema } from '../../utils/validation';
import { useApp } from '../../context/AppContext';
import { X, Plus, Shield } from 'lucide-react';

export const AddResourceModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { createResource } = useApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResourceCreationFormData>({
    resolver: zodResolver(resourceCreationSchema) as any,
    defaultValues: {
      capacity: 4,
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: ResourceCreationFormData) => {
    createResource(data);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-10 overflow-hidden text-slate-100">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Enroll Emergency Unit</h3>
              <p className="text-xs text-slate-400">Add response team or volunteer corps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Unit / Organization Name *
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Westside Volunteer First-Aid Team"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            {errors.name && <p className="text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Resource Type *</label>
              <select
                {...register('type')}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="FIRST_AID_VOLUNTEER">First-Aid Volunteer</option>
                <option value="MEDICAL_SUPPORT_TEAM">Medical Team</option>
                <option value="RESCUE_TEAM">Search & Rescue</option>
                <option value="TRANSPORT_UNIT">Heavy Transport / Fleet</option>
                <option value="SUPPLY_DISTRIBUTION">Supply Distribution</option>
                <option value="FIRE_HAZMAT">Hazmat / Fire</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Crew Capacity *</label>
              <input
                type="number"
                {...register('capacity')}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
              {errors.capacity && <p className="text-red-400 mt-1">{errors.capacity.message}</p>}
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Skills & Certifications (Comma separated) *
            </label>
            <input
              type="text"
              {...register('skills')}
              placeholder="e.g. CPR Certified, Trauma Care, Swiftwater, Defibrillator"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            {errors.skills && <p className="text-red-400 mt-1">{errors.skills.message}</p>}
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Primary Service Area *</label>
            <input
              type="text"
              {...register('serviceArea')}
              placeholder="e.g. Northwest District (Zones 2 & 3)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            {errors.serviceArea && (
              <p className="text-red-400 mt-1">{errors.serviceArea.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Lead Contact Person *</label>
              <input
                type="text"
                {...register('contactPerson')}
                placeholder="e.g. Capt. Sarah Jenkins"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
              {errors.contactPerson && (
                <p className="text-red-400 mt-1">{errors.contactPerson.message}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Contact Phone *</label>
              <input
                type="text"
                {...register('contactPhone')}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
              {errors.contactPhone && (
                <p className="text-red-400 mt-1">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Resource</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
