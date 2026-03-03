// 替换 TestCaseManagement.jsx 中的 startPolling 函数（第 216-243 行）

// 开始轮询任务状态
const startPolling = (taskId) => {
  const timer = setInterval(async () => {
    try {
      const response = await getTaskResult(taskId);
      const taskData = response.data;

      if (taskData.task.status === 'success' || taskData.task.status === 'failed') {
        clearInterval(timer);
        setPollingTimer(null);

        // 设置测试结果
        setTestResult({
          task_id: taskData.task.id,
          case_name: taskData.task.case_name,
          status: taskData.task.status,
          start_time: taskData.task.start_time,
          end_time: taskData.task.end_time,
          duration: calculateDuration(taskData.task.start_time, taskData.task.end_time),
          steps: taskData.steps.map(step => ({
            step: step.step_order,
            action: step.action,
            description: step.description || '',
            status: step.status,
            screenshot: step.screenshot_url,
          })),
          error: taskData.task.report?.error || null,
          logs: JSON.stringify(taskData.task.report, null, 2),
        });
        setResultDrawerVisible(true);

        if (taskData.task.status === 'success') {
          message.success('测试执行完成');
        } else {
          message.error('测试执行失败');
        }
      }
    } catch (error) {
      console.error('轮询状态失败:', error);
    }
  }, 2000); // 每2秒轮询一次

  setPollingTimer(timer);
};

// 计算执行时长（在 startPolling 函数后添加）
const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '-';
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diff = (end - start) / 1000; // 转换为秒
  return `${diff.toFixed(2)}s`;
};
