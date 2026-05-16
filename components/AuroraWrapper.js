'use client';
import dynamic from 'next/dynamic';

const DynamicAurora = dynamic(() => import("./DynamicAurora"), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#02050A] -z-10" />
});

export default function AuroraWrapper() {
  return <DynamicAurora />;
}
