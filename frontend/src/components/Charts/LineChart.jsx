import React from 'react';

const CHART_WIDTH = 760;
const CHART_HEIGHT = 360;
const PADDING = { top: 24, right: 24, bottom: 48, left: 56 };

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

const buildChartPoints = (trends) =>
  trends.map((item) => ({
    label: new Date(`${item.month}-01T00:00:00`).toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit',
    }),
    income: Number(item.income || 0),
    expense: Number(item.expense || 0),
  }));

const buildLinePath = (points, key, maxValue) => {
  const drawableWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const drawableHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  return points
    .map((point, index) => {
      const x = PADDING.left + (points.length === 1 ? drawableWidth / 2 : (index / (points.length - 1)) * drawableWidth);
      const y = PADDING.top + drawableHeight - (point[key] / maxValue) * drawableHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

const LineChart = ({ trends = [] }) => {
  if (!trends.length) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
        Trend data will appear here once transactions are available.
      </div>
    );
  }

  const points = buildChartPoints(trends);
  const maxValue = Math.max(...points.flatMap((point) => [point.income, point.expense]), 1);
  const yAxisValues = Array.from({ length: 5 }, (_, index) => (maxValue / 4) * (4 - index));
  const incomePath = buildLinePath(points, 'income', maxValue);
  const expensePath = buildLinePath(points, 'expense', maxValue);
  const drawableWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const drawableHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-600" />
          Income
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-500" />
          Expense
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-[360px] min-w-[680px] w-full">
          {yAxisValues.map((value, index) => {
            const y = PADDING.top + (index / (yAxisValues.length - 1)) * drawableHeight;

            return (
              <g key={value}>
                <line x1={PADDING.left} y1={y} x2={CHART_WIDTH - PADDING.right} y2={y} stroke="#E2E8F0" strokeDasharray="4 6" />
                <text x={PADDING.left - 12} y={y + 4} textAnchor="end" fontSize="12" fill="#94A3B8">
                  {formatCurrency(value)}
                </text>
              </g>
            );
          })}

          {points.map((point, index) => {
            const x = PADDING.left + (points.length === 1 ? drawableWidth / 2 : (index / (points.length - 1)) * drawableWidth);
            return (
              <text
                key={point.label}
                x={x}
                y={CHART_HEIGHT - 16}
                textAnchor="middle"
                fontSize="12"
                fill="#94A3B8"
              >
                {point.label}
              </text>
            );
          })}

          <path d={incomePath} fill="none" stroke="#286efa" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={expensePath} fill="none" stroke="#F43F5E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point, index) => {
            const x = PADDING.left + (points.length === 1 ? drawableWidth / 2 : (index / (points.length - 1)) * drawableWidth);
            const incomeY = PADDING.top + drawableHeight - (point.income / maxValue) * drawableHeight;
            const expenseY = PADDING.top + drawableHeight - (point.expense / maxValue) * drawableHeight;

            return (
              <g key={`${point.label}-markers`}>
                <circle cx={x} cy={incomeY} r="5" fill="#286efa" />
                <circle cx={x} cy={expenseY} r="5" fill="#F43F5E" />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default LineChart;
