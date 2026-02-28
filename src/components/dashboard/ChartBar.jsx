import React from 'react';
import ReactECharts from 'echarts-for-react';

const ChartBar = ({ data, config = {} }) => {
  const { title = '每日投放额', xField = 'date', yField = 'sales', yLabel = '投放额 (元)' } = config;

  const option = {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
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
        type: 'bar',
        data: data.map(item => item[yField]),
        itemStyle: {
          color: config.color || '#5470c6'
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

export default ChartBar;
