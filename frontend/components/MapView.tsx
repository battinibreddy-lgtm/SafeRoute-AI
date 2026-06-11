"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
});

export default function MapView({
  route,
  startName,
  endName,
}: any) {
  return (
    <LeafletMap
      route={route}
      startName={startName}
      endName={endName}
    />
  );
}
