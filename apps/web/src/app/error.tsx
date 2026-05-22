'use client';
import React from 'react';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <div>Error: {error.message}</div>;
}