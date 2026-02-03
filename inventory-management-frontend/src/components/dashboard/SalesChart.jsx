import React from 'react';
import { Card } from '../common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/helpers';
import { format, parse, isValid, parseISO, subMonths } from 'date-fns';

export const SalesChart = ({ data = [], range }) => {
  
  // Format X-Axis Labels (e.g., "Jan", "Feb")
  const formatXAxis = (tickItem) => {
    try {
        if (range === 'year') {
            // Handle both "2024-05" and "2024-5"
            // Try ISO parse first
            let date = parse(tickItem, 'yyyy-MM', new Date());
            if (!isValid(date)) date = parse(tickItem, 'yyyy-M', new Date()); // Fallback for single digit month
            
            return isValid(date) ? format(date, 'MMM') : tickItem;
        }
        const isoDate = parseISO(tickItem);
        return isValid(isoDate) ? (range === 'day' ? format(isoDate, 'HH:mm') : format(isoDate, 'MMM d')) : tickItem;
    } catch {
        return tickItem;
    }
  };

  const formatTooltipLabel = (label) => {
      try {
          if (range === 'year') {
            let date = parse(label, 'yyyy-MM', new Date());
            if (!isValid(date)) date = parse(label, 'yyyy-M', new Date());
            return isValid(date) ? format(date, 'MMMM yyyy') : label;
          }
          return format(parseISO(label), 'PPP');
      } catch {
          return label;
      }
  };

  // ROBUST DATA FILLING LOGIC
  const filledData = React.useMemo(() => {
      if (range !== 'year') return data;

      // 1. Generate last 12 months (e.g., ["2024-02", "2024-03", ...])
      const allMonths = [];
      const today = new Date();
      for (let i = 11; i >= 0; i--) {
          allMonths.push(format(subMonths(today, i), 'yyyy-MM'));
      }

      // 2. Map generated months to actual data (Flexible Match)
      return allMonths.map(monthKey => {
          // Normalize matching: 
          // monthKey is always "2024-05"
          // API data might be "2024-05" or "2024-5"
          const found = data.find(d => {
              if (!d.date) return false;
              
              // Normalize API date to 2-digit month for comparison
              // e.g., "2024-5" -> "2024-05"
              const parts = d.date.split('-');
              if (parts.length === 2) {
                  const normalizedDate = `${parts[0]}-${parts[1].padStart(2, '0')}`;
                  return normalizedDate === monthKey;
              }
              return d.date === monthKey;
          });

          return {
              date: monthKey,
              revenue: found ? Number(found.revenue) : 0, 
              orderCount: found ? Number(found.orderCount) : 0
          };
      });
  }, [data, range]);

  return (
    <Card title={`Sales Revenue Overview (${range === 'year' ? 'Monthly' : 'Daily'})`}>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={range === 'year' ? filledData : data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                interval={range === 'year' ? 0 : 'preserveStartEnd'}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                tickFormatter={(val) => `₹${val}`}
            />
            <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Revenue']}
                labelFormatter={formatTooltipLabel}
                cursor={{ fill: '#F9FAFB' }}
            />
            <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={range === 'year' ? 30 : 20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};