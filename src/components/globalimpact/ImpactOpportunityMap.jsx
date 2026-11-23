import React from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import 'leaflet/dist/leaflet.css';

function coordinates(value) {
  if (typeof value !== 'string' || !/^\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*$/.test(value)) return null;
  const [lat,lng] = value.split(',').map(Number);
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? [lat,lng] : null;
}

export default function ImpactOpportunityMap({ rows, select, selected }) {
  const names = [...new Set(rows.map(row => row.region?.trim()).filter(Boolean))].sort();
  const locations = useQuery({ queryKey:['impact-map-regions',names], enabled:!!names.length, queryFn:() => base44.entities.Region.filter({ name:{ $in:names } }, 'name', names.length) });
  const regionMap = new Map((locations.data || []).map(region => [region.name, coordinates(region.coordinates)]));
  const markers = new Map();
  rows.forEach(row => { const point = regionMap.get(row.region?.trim()); if (point) { const key = point.join(','); const group = markers.get(key) || { point, rows:[] }; group.rows.push(row); markers.set(key,group); } });
  const center = markers.size === 1 ? markers.values().next().value.point : [20,0];
  return <div className="space-y-2">
    <MapContainer key={center.join(',')} center={center} zoom={markers.size === 1 ? 5 : 2} scrollWheelZoom={false} className="impact-map">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {[...markers.entries()].map(([key,group]) => <CircleMarker key={key} center={group.point} radius={9} pathOptions={{color:'#0369a1',fillOpacity:0.9}} eventHandlers={{ click:() => select(group.rows[0].id) }}><Tooltip>{group.rows[0].region} · {group.rows.length} {group.rows.length === 1 ? 'opportunity' : 'opportunities'}</Tooltip></CircleMarker>)}
    </MapContainer>
    <p className="impact-muted text-xs">{locations.isFetching ? 'Looking up regions…' : locations.isError ? 'Map locations could not be loaded.' : markers.size ? 'Pins mark known regions, not exact sites.' : 'No opportunities on this page have a mapped region.'}</p>
    <ul className="grid gap-1">{rows.map(row => <li key={row.id}><button type="button" aria-pressed={selected === row.id} className="impact-text-link text-left text-sm" onClick={() => select(row.id)}>{row.title} · {row.region || 'No region listed'}</button></li>)}</ul>
  </div>;
}