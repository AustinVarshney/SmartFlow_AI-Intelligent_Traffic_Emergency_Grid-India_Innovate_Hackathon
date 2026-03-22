'use client';

import { motion } from 'framer-motion';
import { ScrollReveal } from '../ScrollReveal';
import { Lightbulb, Rocket, Users, Globe } from 'lucide-react';

const innovations = [
  {
    icon: Lightbulb,
    title: 'Hackathon Innovation',
    description:
      'Built with cutting-edge AI/ML technologies and innovative thinking.',
  },
  {
    icon: Rocket,
    title: 'Startup Ready',
    description:
      'Designed with scalability and commercial viability from day one.',
  },
  {
    icon: Users,
    title: 'Impact-Driven',
    description:
      'Focused on solving real-world urban traffic challenges affecting millions.',
  },
  {
    icon: Globe,
    title: 'Smart City Vision',
    description:
      'Enabling sustainable, efficient, and intelligent urban infrastructure.',
  },
];

export function Innovation() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Hackathon Innovation with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              {' '}
              Startup Potential
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            A project that transcends competition to create real-world impact.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8">
          {innovations.map((innovation, i) => {
            const Icon = innovation.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass-effect rounded-xl p-8 group hover:border-cyan-400/50 transition-all duration-300 border-slate-700"
              >
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 flex-shrink-0"
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {innovation.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {innovation.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Vision statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 p-12 rounded-2xl glass-effect border-cyan-500/30 text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-4">Our Vision</h3>
          <p className="text-xl text-slate-300 leading-relaxed">
            To transform urban transportation by bringing AI intelligence to every traffic
            intersection, creating smarter cities where congestion is minimized, emergency
            response is optimized, and millions of commuters benefit from better, faster
            journeys every single day.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
