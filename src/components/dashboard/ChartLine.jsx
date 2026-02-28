import React from 'react';
import ReactECharts from 'echarts-for-react';

const ChartLine = ({ data, config = {} }) => {
  const { title = '每日利润', xField = 'date', yField = 'profit', yLabel = '利润 (元)' } = config;

  const option = {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item[xField]),
      axisLabel: {
        rotate: 45,
        interval: Math.floor(data.length / 10)
      }
    },
    yAxis: {
      type: 'value',
      name: yLabel
    },
    series: [
      {
        name: yLabel,
        type: 'line',
        data: data.map(item => item[yField]),
        smooth: true,
        itemStyle: {
          color: config.color || '#91cc75'
        },
        areaStyle: {
          color: config.areaColor || 'rgba(145, 204, 117, 0.3)'
        }
      }
    ],
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '15%'
    }
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};

export default ChartLine;
