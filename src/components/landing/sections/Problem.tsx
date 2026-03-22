'use client';

import {
  AlertTriangle,
  Clock,
  Cpu,
  Eye,
  Zap,
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { ScrollReveal } from '../ScrollReveal';

const problems = [
  {
    icon: Zap,
    title: 'Fixed-Time Signals',
    description: 'Traditional traffic lights run on rigid timers, ignoring real-time traffic conditions.',
  },
  {
    icon: AlertTriangle,
    title: 'Peak Hour Gridlock',
    description:
      'No adaptive response to congestion spikes during rush hours creates massive bottlenecks.',
  },
  {
    icon: Clock,
    title: 'Delayed Emergency Response',
    description:
      'Emergency vehicles waste precious seconds waiting at red lights in congested intersections.',
  },
  {
    icon: Eye,
    title: 'No Real-Time Visibility',
    description:
      'Traffic authorities lack intelligent analysis of actual traffic patterns and density.',
  },
  {
    icon: Cpu,
    title: 'Manual Oversight',
    description:
      'Inefficient manual monitoring systems with no AI-powered decision support.',
  },
];

export function Problem() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Current Systems
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              {' '}
              Fail
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Traditional traffic management relies on outdated fixed-time systems that can't
            adapt to modern urban complexity.
          </p>
        </ScrollReveal>

        {/* Problem cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <GlassCard key={i} delay={i * 0.1}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-red-500/20 text-red-400 flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
