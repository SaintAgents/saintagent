import React, { useState } from 'react';
import EventToastCard from '@/components/live/EventToastCard';

export default function DemoActivityToasts({ events, open }) {
  const [index, setIndex] = useState(0);
  const event = events[index];
  if (!event) return null;
  return <EventToastCard key={event.id} event={event} sample duration={5500} open={open} dismiss={id => {
    setIndex(current => events[current]?.id === id ? current + 1 : current);
  }} />;
}