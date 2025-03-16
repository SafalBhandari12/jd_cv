// components/MatchScoreChart.jsx
import React from 'react';
import { Bar } from 'recharts';
import { BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function MatchScoreChart({ candidates }) {
  // Calculate match score distribution
  const scoreRanges = [
    { name: '90-100%', count: 0 },
    { name: '80-89%', count: 0 },
    { name: '70-79%', count: 0 },
    { name: '60-69%', count: 0 },
    { name: 'Below 60%', count: 0 }
  ];

  candidates.forEach(candidate => {
    const score = candidate.matchScore;
    if (score >= 90) {
      scoreRanges[0].count++;
    } else if (score >= 80) {
      scoreRanges[1].count++;
    } else if (score >= 70) {
      scoreRanges[2].count++;
    } else if (score >= 60) {
      scoreRanges[3].count++;
    } else {
      scoreRanges[4].count++;
    }
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={scoreRanges}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MatchScoreChart;
