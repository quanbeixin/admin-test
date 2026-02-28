import React from 'react';
import ReactECharts from 'echarts-for-react';

const ChartPie = ({ data, config = {} }) => {
  const { title = '产品分类占比', categoryField = 'category', valueField = 'sales' } = config;

  const categoryData = data.reduce((acc, item) => {
    const existing = acc.find(x => x.name === item[categoryField]);
    if (existing) {
      existing.value += item[valueField];
    } else {
      acc.push({ name: item[categoryField], value: item[valueField] });
    }
    return acc;
  }, []);

  const option = {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: valueField,
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        data: categoryData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};

export default ChartPie;
