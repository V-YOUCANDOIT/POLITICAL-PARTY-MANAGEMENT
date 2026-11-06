import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import {
  MapPin,
  Building2,
  Users,
  Compass,
  CheckCircle,
  Flag,
  Layers,
  BarChart3,
  Globe
} from 'lucide-react';

interface StateGeo {
  id: string;
  name: string;
  coordinates: [number, number];
  unitsCount: number;
  volunteersCount: number;
  activeCampaigns: number;
  districts: {
    name: string;
    center: [number, number];
    units: number;
    volunteers: number;
  }[];
}

interface GeoData {
  states: StateGeo[];
  totalUnits: number;
  totalDistricts: number;
  coverageScore: string;
}

export const GeographyView: React.FC = () => {
  const { showToast } = useToast();
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [selectedState, setSelectedState] = useState<StateGeo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGeo() {
      try {
        setLoading(true);
        const data = await apiRequest<GeoData>('/api/geography');
        setGeoData(data);
        if (data.states && data.states.length > 0) {
          setSelectedState(data.states[0]);
        }
      } catch (e: any) {
        showToast(e.message || 'Failed to load geographical data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadGeo();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Geographical Administration & Territorial Coverage
          </h2>
          <p className="text-xs text-slate-400">
            Provincial jurisdiction map, local field unit density, and constituency-level organizational footprint.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-semibold font-mono">
            Territorial Coverage: {geoData?.coverageScore || '89.4%'}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Interactive SVG Map Vector, Right Regional Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Offline Geographical Vector Display */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Territorial Jurisdictions (Offline Vector Grid)
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">100% Offline Vector Projection</span>
          </div>

          {/* Interactive SVG Geographic Fallback / Map Canvas */}
          <div className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden">
            <svg
              viewBox="0 0 600 380"
              className="w-full h-auto max-h-[360px] select-none"
            >
              {/* Grid Background */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="600" height="380" fill="url(#grid)" />

              {/* State 1: North Province (Top Left to Top Center) */}
              <g
                onClick={() => geoData?.states[0] && setSelectedState(geoData.states[0])}
                className="cursor-pointer group"
              >
                <path
                  d="M 60 50 L 280 40 L 320 150 L 120 160 Z"
                  className={`transition-colors ${
                    selectedState?.id === 'state-north'
                      ? 'fill-blue-600/40 stroke-blue-400 stroke-2'
                      : 'fill-slate-800/60 stroke-slate-700 hover:fill-blue-900/40 hover:stroke-blue-500'
                  }`}
                />
                <circle cx="170" cy="95" r="6" className="fill-blue-400 animate-ping opacity-75" />
                <circle cx="170" cy="95" r="5" className="fill-blue-500" />
                <text x="170" y="80" textAnchor="middle" className="fill-white text-[11px] font-bold">
                  North Province
                </text>
                <text x="170" y="120" textAnchor="middle" className="fill-slate-400 text-[9px] font-mono">
                  2 Units • 8 Volunteers
                </text>
              </g>

              {/* State 2: Central State (Middle & Capital) */}
              <g
                onClick={() => geoData?.states[1] && setSelectedState(geoData.states[1])}
                className="cursor-pointer group"
              >
                <path
                  d="M 140 180 L 380 160 L 440 280 L 190 300 Z"
                  className={`transition-colors ${
                    selectedState?.id === 'state-central'
                      ? 'fill-emerald-600/40 stroke-emerald-400 stroke-2'
                      : 'fill-slate-800/60 stroke-slate-700 hover:fill-emerald-900/40 hover:stroke-emerald-500'
                  }`}
                />
                <circle cx="280" cy="225" r="7" className="fill-emerald-400 animate-ping opacity-75" />
                <circle cx="280" cy="225" r="5" className="fill-emerald-500" />
                <text x="280" y="210" textAnchor="middle" className="fill-white text-[11px] font-bold">
                  Central State (National HQ)
                </text>
                <text x="280" y="250" textAnchor="middle" className="fill-slate-400 text-[9px] font-mono">
                  3 Units • 12 Volunteers
                </text>
              </g>

              {/* State 3: Coastal Region (South East) */}
              <g
                onClick={() => geoData?.states[2] && setSelectedState(geoData.states[2])}
                className="cursor-pointer group"
              >
                <path
                  d="M 400 170 L 550 180 L 530 330 L 390 310 Z"
                  className={`transition-colors ${
                    selectedState?.id === 'state-coastal'
                      ? 'fill-amber-600/40 stroke-amber-400 stroke-2'
                      : 'fill-slate-800/60 stroke-slate-700 hover:fill-amber-900/40 hover:stroke-amber-500'
                  }`}
                />
                <circle cx="460" cy="245" r="6" className="fill-amber-400 animate-ping opacity-75" />
                <circle cx="460" cy="245" r="5" className="fill-amber-500" />
                <text x="460" y="230" textAnchor="middle" className="fill-white text-[11px] font-bold">
                  Coastal Region
                </text>
                <text x="460" y="270" textAnchor="middle" className="fill-slate-400 text-[9px] font-mono">
                  2 Units • 7 Volunteers
                </text>
              </g>
            </svg>

            {/* Map Legend */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> North Province
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Central State
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Coastal Region
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Click on any geographical territory polygon above to inspect district branches, field staff density, and local civic priorities.
          </p>
        </div>

        {/* Right Column: Territory Details & District Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {selectedState ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider">
                    Provincial Directorate
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedState.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-mono">Coverage</span>
                  <p className="text-base font-bold text-emerald-400 font-mono">92%</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Units</span>
                  <p className="text-base font-bold text-white font-mono mt-0.5">{selectedState.unitsCount}</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Volunteers</span>
                  <p className="text-base font-bold text-cyan-400 font-mono mt-0.5">{selectedState.volunteersCount}</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Campaigns</span>
                  <p className="text-base font-bold text-indigo-400 font-mono mt-0.5">{selectedState.activeCampaigns}</p>
                </div>
              </div>

              {/* Districts within this State */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Constituent District Branches</span>
                </h4>

                <div className="space-y-2">
                  {selectedState.districts?.map((d) => (
                    <div key={d.name} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-white">{d.name} District</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {d.units} Operational Field Command
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md font-mono">
                        {d.volunteers} Volunteers
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Aggregated Civic Feedback */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Regional Survey Priorities</span>
                </h4>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Public Transit & Commuter Connectivity:</span>
                    <strong className="text-blue-400">High Demand (84%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Park Upgrades & Green Infrastructure:</span>
                    <strong className="text-emerald-400">Positive (78%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Small Merchant Revitalization:</span>
                    <strong className="text-amber-400">Moderate (65%)</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              Select a territory on the map to review jurisdiction details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
