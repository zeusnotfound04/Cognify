'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Hero } from "@/components/hero";
import { Leva } from "leva";

export default function Home() {
    const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  return (
    <>
      <Hero />
      <Leva hidden />
    </>
  );
}
 