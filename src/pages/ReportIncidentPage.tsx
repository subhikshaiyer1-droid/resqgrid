import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IncidentReportFormData, incidentReportSchema } from '../utils/validation';
import { useApp } from '../context/AppContext';
import { LocationPickerMap } from '../components/map/LocationPickerMap';
import { computeSmartPriorityScore } from '../utils/priorityEngine';
import {
  AlertTriangle,
  MapPin,
  Camera,
  CheckCircle2,
  Phone,
  User,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ReportIncidentPage: React.FC = () => {
  const { submitIncidentReport, setActiveTab, setSelectedIncident, currentUser } = useApp();

  const [submittedIncident, setSubmittedIncident] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncidentReportFormData>({
    resolver: zodResolver(incidentReportSchema) as any,
    defaultValues: {
      category: 'MEDICAL_EMERGENCY',
      severity: 'HIGH',
      affectedCount: 1,
      lat: 37.7749,
      lng: -122.4194,
      locationName: '',
      consent: true,
      reporterName: currentUser.fullName,
    },
  });

  const watchedSeverity = watch('severity');
  const watchedAffected = watch('affectedCount');
  const watchedLat = watch('lat');
  const watchedLng = watch('lng');

  // Real-time live priority calculation preview
  const livePriority = computeSmartPriorityScore({
    severity: watchedSeverity || 'HIGH',
    affectedCount: Number(watchedAffected) || 1,
    createdAt: new Date().toISOString(),
    status: 'REPORTED',
  });

  const handleSimulatedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setValue('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: IncidentReportFormData) => {
    try {
      const created = await submitIncidentReport(data);
      setSubmittedIncident(created);
      reset();
      setImagePreview(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Submit Community Incident Report
            </h1>
            <p className="text-xs text-slate-400">
              Direct telemetry ingestion to the ResQGrid emergency dispatch queue
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Emergency Callout Banner */}
      <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            DO NOT USE FOR IMMEDIATE LIFE-THREATENING EMERGENCIES IF POLICE/FIRE DISPATCH IS REQUIRED
          </p>
          <p className="text-red-300/90 text-[11px] leading-relaxed">
            This platform is an operational portfolio simulation and does not monitor 911 lines in real-time.
            Always dial 911 (or local emergency services) first.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column (2 Cols) */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Incident Headline / Title *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Multi-vehicle pileup blocking highway express lane"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/60"
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Category & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Incident Category *
              </label>
              <select
                {...register('category')}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="ROAD_ACCIDENT">Road Accident</option>
                <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
                <option value="FIRE_OUTBREAK">Fire Outbreak</option>
                <option value="FLOODING">Flooding / Waterlogging</option>
                <option value="BLOCKED_ROAD">Blocked Road / Fallen Tree</option>
                <option value="MISSING_PERSON">Missing Person</option>
                <option value="PUBLIC_SAFETY">Public Safety Hazard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Reported Severity *
              </label>
              <select
                {...register('severity')}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="CRITICAL">Critical (Immediate Life Hazard)</option>
                <option value="HIGH">High (Substantial Hazard / Injury)</option>
                <option value="MEDIUM">Medium (Non-Life Threatening)</option>
                <option value="LOW">Low (Minor Disruption / Inconvenience)</option>
              </select>
            </div>
          </div>

          {/* People Affected Count */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Estimated Number of People Directly Impacted *
            </label>
            <input
              type="number"
              min={0}
              {...register('affectedCount')}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
            />
            {errors.affectedCount && (
              <p className="text-red-400 text-xs mt-1">{errors.affectedCount.message}</p>
            )}
          </div>

          {/* Location Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Location Description / Landmark / Address *
            </label>
            <input
              type="text"
              {...register('locationName')}
              placeholder="e.g. 5th Ave & Market St, opposite Central Plaza Library"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500"
            />
            {errors.locationName && (
              <p className="text-red-400 text-xs mt-1">{errors.locationName.message}</p>
            )}
          </div>

          {/* Interactive Map Location Pinning */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">
              GIS Coordinates & Location Pin
            </span>
            <LocationPickerMap
              lat={watchedLat || 37.7749}
              lng={watchedLng || -122.4194}
              onChange={(lat, lng) => {
                setValue('lat', lat);
                setValue('lng', lng);
              }}
            />
            {errors.lat && <p className="text-red-400 text-xs mt-1">{errors.lat.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Detailed Situation Description *
            </label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder="Describe what happened, any visible hazards (smoke, fuel, power lines), patient consciousness, road obstructions..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/60"
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Optional Reporter Info (Masked publicly) */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              Optional Contact Information (Restricted to Coordinators)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Your Name</label>
                <input
                  type="text"
                  {...register('reporterName')}
                  placeholder="Citizen Name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Phone / Callback Number
                </label>
                <input
                  type="text"
                  {...register('reporterContact')}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Contact info is private and only visible to authorized coordinators for callback confirmation.
            </p>
          </div>

          {/* Photo / Scene Image Attachment */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              Optional Scene Photo Attachment
            </span>
            <div className="flex items-center gap-3">
              <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5 transition-colors">
                <Camera className="w-3.5 h-3.5 text-red-400" />
                <span>Upload Scene Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSimulatedImageUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-400">
                {imagePreview ? 'Photo attached' : 'JPEG, PNG up to 5MB'}
              </span>
            </div>

            {imagePreview && (
              <div className="relative mt-2 w-32 h-24 rounded-lg overflow-hidden border border-slate-700">
                <img
                  src={imagePreview}
                  alt="Incident preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setValue('imageUrl', undefined);
                  }}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded p-0.5 text-[10px]"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Mandatory Consent Checkbox */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register('consent')}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500"
              />
              <span className="text-xs text-slate-300 leading-snug">
                I acknowledge that this report is submitted for community coordination in a portfolio demonstration platform.
                I confirm the information is provided in good faith and understand this does not contact official 911 dispatchers.
              </span>
            </label>
            {errors.consent && (
              <p className="text-red-400 text-xs">{errors.consent.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-950/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <span>Transmit Incident Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Live Triage Preview Card (Right Col) */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 sticky top-24">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Live Priority Score Preview
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase">
                Predicted Triage Classification
              </span>
              <p className="text-base font-bold text-red-400 leading-snug">
                {livePriority.tierLabel}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-mono font-black text-white">
                  {livePriority.totalScore}
                </span>
                <span className="text-slate-500 font-mono text-xs">/ 100</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-400 text-[11px] block">
                Dynamic Weight Contribution:
              </span>
              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Severity (45%)</span>
                  <span className="font-mono text-slate-200">{livePriority.severityScore} pts</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">People Impacted (25%)</span>
                  <span className="font-mono text-slate-200">{livePriority.affectedScore} pts</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Queue Time (20%)</span>
                  <span className="font-mono text-slate-200">{livePriority.waitingScore} pts</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Verification Base (10%)</span>
                  <span className="font-mono text-slate-200">{livePriority.verificationScore} pts</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              <p className="font-bold text-slate-300 mb-1">Dispatcher Transparency</p>
              Once submitted, this report will immediately appear in the Operations Dashboard and GIS Map with an initial status of <strong>REPORTED</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Submission Success Confirmation Modal */}
      {submittedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-10 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <span className="font-mono text-xs font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {submittedIncident.id}
              </span>
              <h3 className="text-lg font-bold text-white mt-2">
                Emergency Incident Registered
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your report <strong>"{submittedIncident.title}"</strong> has been logged to the dispatch queue with Priority <strong>{submittedIncident.priority.tier}</strong>.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  setSelectedIncident(submittedIncident);
                  setActiveTab('incidents');
                  setSubmittedIncident(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors"
              >
                Track in Incident Queue
              </button>
              <button
                onClick={() => setSubmittedIncident(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
