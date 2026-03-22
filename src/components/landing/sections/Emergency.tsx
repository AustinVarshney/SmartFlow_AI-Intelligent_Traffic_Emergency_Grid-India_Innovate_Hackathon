'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Ambulance, MapPin } from 'lucide-react';
import { ScrollReveal } from '../ScrollReveal';

export function Emergency() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Emergency Response,
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              {' '}
              Elevated
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Life-saving technology that prioritizes emergency vehicles with intelligent green corridors.
          </p>
        </ScrollReveal>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-effect rounded-2xl p-12 border-red-500/30 relative overflow-hidden">
            {/* Animated background glow */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 40px rgba(239, 68, 68, 0.2)',
                  '0 0 60px rgba(239, 68, 68, 0.4)',
                  '0 0 40px rgba(239, 68, 68, 0.2)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl"
            />

            <div className="relative z-10 space-y-8">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30"
              >
                <Ambulance className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">
                    Emergency Vehicle Detected
                  </h3>
                  <p className="text-slate-300">
                    System identifies ambulance, fire truck, or police vehicle through GPS or CCTV
                    recognition.
                  </p>
                </div>
              </motion.div>

              {/* Arrow */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex justify-center text-red-400 text-2xl"
              >
                ↓
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30"
              >
                <AlertTriangle className="w-8 h-8 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-orange-400 mb-2">
                    Signal Override Activated
                  </h3>
                  <p className="text-slate-300">
                    AI immediately overrides current signal timing and initiates emergency
                    protocols.
                  </p>
                </div>
              </motion.div>

              {/* Arrow */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                className="flex justify-center text-orange-400 text-2xl"
              >
                ↓
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30"
              >
                <MapPin className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">
                    Green Corridor Enabled
                  </h3>
                  <p className="text-slate-300">
                    Entire route turns green, allowing emergency vehicles to reach their destination
                    50% faster.
                  </p>
                </div>
              </motion.div>

              {/* Result box */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-6 rounded-lg bg-gradient-to-r from-green-500/20 to-sky-500/20 border border-green-500/50"
              >
                <p className="text-center text-lg font-bold text-white">
                  Result: <span className="text-green-400">Lifesaving Response Time</span>
                </p>
                <p className="text-center text-slate-300 mt-2">
                  Every second counts in emergencies. Our system ensures maximum efficiency when
                  it matters most.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
