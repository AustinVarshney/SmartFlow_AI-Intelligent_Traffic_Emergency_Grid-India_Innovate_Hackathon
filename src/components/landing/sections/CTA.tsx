'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Github } from 'lucide-react';
import { GlowButton } from '../GlowButton';
import { ScrollReveal } from '../ScrollReveal';

export function CTA() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <ScrollReveal className="text-center space-y-8">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-bold text-white leading-tight"
          >
            Transform Traffic Chaos into
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-400 to-purple-400">
              {' '}
              Intelligent Flow
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Join the future of urban traffic management. Deploy AI-powered traffic
            optimization in your city and see the impact immediately.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-8"
          >
            <GlowButton variant="primary" className="text-lg px-8 py-4">
              Schedule Demo
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </GlowButton>
            <GlowButton variant="secondary" className="text-lg px-8 py-4">
              Explore GitHub
              <Github className="w-5 h-5 ml-2 inline" />
            </GlowButton>
          </motion.div>

          {/* Trust statement */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-slate-400 text-sm pt-8"
          >
            Trusted by leading municipalities and smart city initiatives worldwide.
          </motion.p>
        </ScrollReveal>
      </div>
    </section>
  );
}
