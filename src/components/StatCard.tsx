import { motion } from 'motion/react';
import { Package, Users, ClipboardList, TrendingUp } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, color }: { 
  title: string, 
  value: string | number, 
  icon: any, 
  trend?: string,
  color: 'emerald' | 'blue' | 'purple' | 'orange'
}) {
  const colors = {
    emerald: 'from-emerald-400/20 to-emerald-600/20 text-emerald-400 border-emerald-500/20',
    blue: 'from-blue-400/20 to-blue-600/20 text-blue-400 border-blue-500/20',
    purple: 'from-purple-400/20 to-purple-600/20 text-purple-400 border-purple-500/20',
    orange: 'from-orange-400/20 to-orange-600/20 text-orange-400 border-orange-500/20',
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`bg-white/10 backdrop-blur-md border ${colors[color]} p-6 rounded-3xl relative overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
      
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/60">
            {trend}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-white/60 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
}
